import { Injectable, NotFoundException } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { Prisma } from "@prisma/client";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertCompanyDto } from "./dto/company.dto";

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(actor: AuthUser, query: PaginationQueryDto) {
    const where: Prisma.CompanyWhereInput = {
      organizationId: actor.organizationId,
      deletedAt: null,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { city: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        skip: query.skip,
        take: query.pageSize,
        orderBy: { name: "asc" },
        include: { _count: { select: { contacts: true, bookings: true } } },
      }),
      this.prisma.company.count({ where }),
    ]);

    return { data: items, meta: { total, page: query.page, pageSize: query.pageSize } };
  }

  async get(actor: AuthUser, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, organizationId: actor.organizationId, deletedAt: null },
      include: {
        contacts: {
          where: { deletedAt: null },
          orderBy: { lastName: "asc" },
        },
        _count: { select: { contacts: true, bookings: true } },
      },
    });
    if (!company) throw new NotFoundException("Company not found");
    return company;
  }

  create(actor: AuthUser, dto: UpsertCompanyDto) {
    return this.prisma.company.create({
      data: { ...dto, organizationId: actor.organizationId },
    });
  }

  async update(actor: AuthUser, id: string, dto: UpsertCompanyDto) {
    await this.get(actor, id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(actor: AuthUser, id: string) {
    await this.get(actor, id);
    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }
}
