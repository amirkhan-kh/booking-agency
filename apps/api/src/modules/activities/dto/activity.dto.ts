import { IsEnum, IsOptional, IsString } from "class-validator";
import { ACTIVITY_TYPES, type ActivityType } from "@marquee/shared";

export class CreateActivityDto {
  @IsEnum(ACTIVITY_TYPES)
  type!: ActivityType;

  @IsString()
  body!: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;
}
