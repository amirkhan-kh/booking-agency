import { Injectable } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateActivityDto } from "./dto/activity.dto";

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(actor: AuthUser, dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        organizationId: actor.organizationId,
        actorId: actor.id,
        type: dto.type,
        body: dto.body,
        contactId: dto.contactId,
        bookingId: dto.bookingId,
      },
      include: { actor: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}
