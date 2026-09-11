import { Injectable, NotFoundException } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { Prisma } from "@prisma/client";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { toNumber } from "../../common/money";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateDealStageDto, UpsertDealDto } from "./dto/deal.dto";

const include = {
  talent: { select: { id: true, name: true } },
  company: { select: { id: true, name: true } },
  contact: { select: { id: true, firstName: true, lastName: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(actor: AuthUser, query: PaginationQueryDto) {
    const where: Prisma.DealWhereInput = {
      organizationId: actor.organizationId,
      deletedAt: null,
      ...(query.q
        ? { title: { contains: query.q, mode: "insensitive" } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.deal.findMany({
        where,
        skip: query.skip,
        take: query.pageSize,
        orderBy: { updatedAt: "desc" },
        include,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      data: items.map((d) => this.serialize(d)),
      meta: { total, page: query.page, pageSize: query.pageSize },
    };
  }

  async board(actor: AuthUser) {
    const deals = await this.prisma.deal.findMany({
      where: { organizationId: actor.organizationId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include,
    });
    return deals.map((d) => this.serialize(d));
  }

  async get(actor: AuthUser, id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, organizationId: actor.organizationId, deletedAt: null },
      include,
    });
    if (!deal) throw new NotFoundException("Deal not found");
    return this.serialize(deal);
  }

  async create(actor: AuthUser, dto: UpsertDealDto) {
    const deal = await this.prisma.deal.create({
      data: {
        ...this.toData(dto),
        organizationId: actor.organizationId,
        ownerId: dto.ownerId ?? actor.id,
      },
      include,
    });
    return this.serialize(deal);
  }

  async update(actor: AuthUser, id: string, dto: UpsertDealDto) {
    await this.ensure(actor, id);
    const deal = await this.prisma.deal.update({
      where: { id },
      data: this.toData(dto),
      include,
    });
    return this.serialize(deal);
  }

  async updateStage(actor: AuthUser, id: string, dto: UpdateDealStageDto) {
    await this.ensure(actor, id);
    const deal = await this.prisma.deal.update({
      where: { id },
      data: { stage: dto.stage },
      include,
    });
    return this.serialize(deal);
  }

  async remove(actor: AuthUser, id: string) {
    await this.ensure(actor, id);
    await this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  private async ensure(actor: AuthUser, id: string) {
    const found = await this.prisma.deal.findFirst({
      where: { id, organizationId: actor.organizationId, deletedAt: null },
    });
    if (!found) throw new NotFoundException("Deal not found");
  }

  private toData(dto: UpsertDealDto) {
    return {
      title: dto.title,
      stage: dto.stage,
      value: dto.value,
      expectedClose: dto.expectedClose ? new Date(dto.expectedClose) : null,
      ownerId: dto.ownerId,
      talentId: dto.talentId,
      companyId: dto.companyId,
      contactId: dto.contactId,
      notes: dto.notes,
    };
  }

  private serialize<T extends { value: Prisma.Decimal | null }>(deal: T) {
    return { ...deal, value: toNumber(deal.value) };
  }
}
