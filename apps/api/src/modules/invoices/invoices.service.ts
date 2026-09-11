import { Injectable, NotFoundException } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { Prisma } from "@prisma/client";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { toNumber } from "../../common/money";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateInvoiceDto, UpdateInvoiceDto } from "./dto/invoice.dto";

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(actor: AuthUser, query: PaginationQueryDto) {
    const where: Prisma.InvoiceWhereInput = {
      organizationId: actor.organizationId,
      deletedAt: null,
      ...(query.q
        ? {
            OR: [
              { number: { contains: query.q, mode: "insensitive" } },
              { booking: { title: { contains: query.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        skip: query.skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          booking: { select: { id: true, title: true, eventDate: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: items.map((i) => this.serialize(i)),
      meta: { total, page: query.page, pageSize: query.pageSize },
    };
  }

  async create(actor: AuthUser, dto: CreateInvoiceDto) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: dto.bookingId,
        organizationId: actor.organizationId,
        deletedAt: null,
      },
    });
    if (!booking) throw new NotFoundException("Booking not found");

    const count = await this.prisma.invoice.count({
      where: { organizationId: actor.organizationId },
    });
    const number = `INV-${String(count + 1).padStart(4, "0")}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        organizationId: actor.organizationId,
        bookingId: dto.bookingId,
        number,
        amount: dto.amount,
        amountPaid: dto.amountPaid ?? 0,
        currency: dto.currency ?? "USD",
        status: dto.status ?? "DRAFT",
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : null,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        notes: dto.notes,
      },
      include: { booking: { select: { id: true, title: true, eventDate: true } } },
    });
    return this.serialize(invoice);
  }

  async update(actor: AuthUser, id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findFirst({
      where: { id, organizationId: actor.organizationId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException("Invoice not found");

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: dto,
      include: { booking: { select: { id: true, title: true, eventDate: true } } },
    });
    return this.serialize(invoice);
  }

  private serialize<T extends { amount: Prisma.Decimal; amountPaid: Prisma.Decimal }>(
    invoice: T,
  ) {
    return {
      ...invoice,
      amount: toNumber(invoice.amount) ?? 0,
      amountPaid: toNumber(invoice.amountPaid) ?? 0,
    };
  }
}
