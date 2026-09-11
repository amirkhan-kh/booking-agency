import { Injectable, NotFoundException } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { Prisma } from "@prisma/client";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { toNumber } from "../../common/money";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateBookingStatusDto, UpsertBookingDto } from "./dto/booking.dto";

const include = {
  talent: { select: { id: true, name: true, genre: true } },
  company: { select: { id: true, name: true, type: true } },
  contact: { select: { id: true, firstName: true, lastName: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(actor: AuthUser, query: PaginationQueryDto) {
    const where: Prisma.BookingWhereInput = {
      organizationId: actor.organizationId,
      deletedAt: null,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { venueName: { contains: query.q, mode: "insensitive" } },
              { city: { contains: query.q, mode: "insensitive" } },
              { talent: { name: { contains: query.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        skip: query.skip,
        take: query.pageSize,
        orderBy: { eventDate: "asc" },
        include,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: items.map((b) => this.serialize(b)),
      meta: { total, page: query.page, pageSize: query.pageSize },
    };
  }

  async get(actor: AuthUser, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, organizationId: actor.organizationId, deletedAt: null },
      include: {
        ...include,
        invoices: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { actor: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    return {
      ...this.serialize(booking),
      invoices: booking.invoices.map((i) => ({
        ...i,
        amount: toNumber(i.amount) ?? 0,
        amountPaid: toNumber(i.amountPaid) ?? 0,
      })),
    };
  }

  async create(actor: AuthUser, dto: UpsertBookingDto) {
    const booking = await this.prisma.booking.create({
      data: {
        ...this.toData(dto),
        organizationId: actor.organizationId,
        ownerId: dto.ownerId ?? actor.id,
      },
      include,
    });
    return this.serialize(booking);
  }

  async update(actor: AuthUser, id: string, dto: UpsertBookingDto) {
    await this.ensure(actor, id);
    const booking = await this.prisma.booking.update({
      where: { id },
      data: this.toData(dto),
      include,
    });
    return this.serialize(booking);
  }

  async updateStatus(actor: AuthUser, id: string, dto: UpdateBookingStatusDto) {
    const existing = await this.ensure(actor, id);
    const booking = await this.prisma.booking.update({
      where: { id },
      data: { status: dto.status },
      include,
    });
    await this.prisma.activity.create({
      data: {
        organizationId: actor.organizationId,
        type: "STATUS_CHANGE",
        body: `Status ${existing.status} → ${dto.status}`,
        actorId: actor.id,
        bookingId: id,
      },
    });
    return this.serialize(booking);
  }

  async remove(actor: AuthUser, id: string) {
    await this.ensure(actor, id);
    await this.prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  private async ensure(actor: AuthUser, id: string) {
    const found = await this.prisma.booking.findFirst({
      where: { id, organizationId: actor.organizationId, deletedAt: null },
    });
    if (!found) throw new NotFoundException("Booking not found");
    return found;
  }

  private toData(dto: UpsertBookingDto) {
    return {
      title: dto.title,
      status: dto.status,
      eventDate: new Date(dto.eventDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      venueName: dto.venueName,
      city: dto.city,
      fee: dto.fee,
      deposit: dto.deposit,
      currency: dto.currency ?? "USD",
      talentId: dto.talentId,
      companyId: dto.companyId,
      contactId: dto.contactId,
      ownerId: dto.ownerId,
      dealId: dto.dealId,
      notes: dto.notes,
    };
  }

  private serialize<T extends { fee: Prisma.Decimal | null; deposit: Prisma.Decimal | null }>(
    booking: T,
  ) {
    return {
      ...booking,
      fee: toNumber(booking.fee),
      deposit: toNumber(booking.deposit),
    };
  }
}
