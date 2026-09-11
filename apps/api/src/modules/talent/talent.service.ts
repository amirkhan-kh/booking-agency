import { Injectable, NotFoundException } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { Prisma } from "@prisma/client";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { toNumber } from "../../common/money";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertTalentDto } from "./dto/talent.dto";

@Injectable()
export class TalentService {
  constructor(private readonly prisma: PrismaService) {}

  async list(actor: AuthUser, query: PaginationQueryDto) {
    const where: Prisma.TalentWhereInput = {
      organizationId: actor.organizationId,
      deletedAt: null,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { genre: { contains: query.q, mode: "insensitive" } },
              { homeCity: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.talent.findMany({
        where,
        skip: query.skip,
        take: query.pageSize,
        orderBy: { name: "asc" },
        include: { _count: { select: { bookings: true } } },
      }),
      this.prisma.talent.count({ where }),
    ]);

    return {
      data: items.map((t) => this.serialize(t)),
      meta: { total, page: query.page, pageSize: query.pageSize },
    };
  }

  async get(actor: AuthUser, id: string) {
    const talent = await this.prisma.talent.findFirst({
      where: { id, organizationId: actor.organizationId, deletedAt: null },
      include: {
        bookings: {
          where: { deletedAt: null },
          orderBy: { eventDate: "desc" },
          take: 10,
        },
        _count: { select: { bookings: true } },
      },
    });
    if (!talent) throw new NotFoundException("Talent not found");
    return {
      ...this.serialize(talent),
      bookings: talent.bookings.map((b) => ({
        ...b,
        fee: toNumber(b.fee),
        deposit: toNumber(b.deposit),
      })),
    };
  }

  async create(actor: AuthUser, dto: UpsertTalentDto) {
    const talent = await this.prisma.talent.create({
      data: { ...dto, organizationId: actor.organizationId },
    });
    return this.serialize(talent);
  }

  async update(actor: AuthUser, id: string, dto: UpsertTalentDto) {
    await this.ensure(actor, id);
    const talent = await this.prisma.talent.update({ where: { id }, data: dto });
    return this.serialize(talent);
  }

  async remove(actor: AuthUser, id: string) {
    await this.ensure(actor, id);
    await this.prisma.talent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  private async ensure(actor: AuthUser, id: string) {
    const found = await this.prisma.talent.findFirst({
      where: { id, organizationId: actor.organizationId, deletedAt: null },
    });
    if (!found) throw new NotFoundException("Talent not found");
  }

  private serialize<T extends { feeMin: Prisma.Decimal | null; feeMax: Prisma.Decimal | null }>(
    talent: T,
  ) {
    return {
      ...talent,
      feeMin: toNumber(talent.feeMin),
      feeMax: toNumber(talent.feeMax),
    };
  }
}
