import { Injectable } from "@nestjs/common";
import type { AuthUser, DealStage } from "@marquee/shared";
import { DEAL_STAGES } from "@marquee/shared";
import { toNumber } from "../../common/money";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(actor: AuthUser) {
    const org = actor.organizationId;
    const now = new Date();

    const [talentActive, bookingsUpcoming, deals, invoices, recentBookings] =
      await Promise.all([
        this.prisma.talent.count({
          where: { organizationId: org, deletedAt: null, status: "ACTIVE" },
        }),
        this.prisma.booking.count({
          where: {
            organizationId: org,
            deletedAt: null,
            eventDate: { gte: now },
            status: { in: ["HOLD", "CONFIRMED", "CONTRACTED"] },
          },
        }),
        this.prisma.deal.findMany({
          where: { organizationId: org, deletedAt: null },
          select: { stage: true, value: true },
        }),
        this.prisma.invoice.findMany({
          where: {
            organizationId: org,
            deletedAt: null,
            status: { in: ["SENT", "PARTIAL", "OVERDUE"] },
          },
          select: { amount: true, amountPaid: true },
        }),
        this.prisma.booking.findMany({
          where: { organizationId: org, deletedAt: null, eventDate: { gte: now } },
          orderBy: { eventDate: "asc" },
          take: 6,
          include: {
            talent: { select: { id: true, name: true, genre: true } },
            company: { select: { id: true, name: true, type: true } },
          },
        }),
      ]);

    const openStages = new Set(["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION"]);
    const pipelineValue = deals
      .filter((d) => openStages.has(d.stage))
      .reduce((sum, d) => sum + (toNumber(d.value) ?? 0), 0);

    const invoicesOutstanding = invoices.reduce(
      (sum, i) => sum + ((toNumber(i.amount) ?? 0) - (toNumber(i.amountPaid) ?? 0)),
      0,
    );

    const pipelineByStage = DEAL_STAGES.map((stage: DealStage) => {
      const rows = deals.filter((d) => d.stage === stage);
      return {
        stage,
        count: rows.length,
        value: rows.reduce((sum, d) => sum + (toNumber(d.value) ?? 0), 0),
      };
    });

    return {
      talentActive,
      bookingsUpcoming,
      pipelineValue,
      invoicesOutstanding,
      pipelineByStage,
      recentBookings: recentBookings.map((b) => ({
        ...b,
        fee: toNumber(b.fee),
        deposit: toNumber(b.deposit),
      })),
    };
  }
}
