import { Injectable, NotFoundException } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { Prisma } from "@prisma/client";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertContactDto } from "./dto/contact.dto";

const companySelect = { id: true, name: true, type: true } as const;

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(actor: AuthUser, query: PaginationQueryDto) {
    const where: Prisma.ContactWhereInput = {
      organizationId: actor.organizationId,
      deletedAt: null,
      ...(query.q
        ? {
            OR: [
              { firstName: { contains: query.q, mode: "insensitive" } },
              { lastName: { contains: query.q, mode: "insensitive" } },
              { email: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.contact.findMany({
        where,
        skip: query.skip,
        take: query.pageSize,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: { company: { select: companySelect } },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { data: items, meta: { total, page: query.page, pageSize: query.pageSize } };
  }

  async get(actor: AuthUser, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, organizationId: actor.organizationId, deletedAt: null },
      include: {
        company: { select: companySelect },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { actor: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    if (!contact) throw new NotFoundException("Contact not found");
    return contact;
  }

  create(actor: AuthUser, dto: UpsertContactDto) {
    return this.prisma.contact.create({
      data: { ...dto, organizationId: actor.organizationId },
      include: { company: { select: companySelect } },
    });
  }

  async update(actor: AuthUser, id: string, dto: UpsertContactDto) {
    await this.get(actor, id);
    return this.prisma.contact.update({
      where: { id },
      data: dto,
      include: { company: { select: companySelect } },
    });
  }

  async remove(actor: AuthUser, id: string) {
    await this.get(actor, id);
    await this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }
}
