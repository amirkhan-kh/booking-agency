import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { TALENT_STATUSES, type TalentStatus } from "@marquee/shared";

export class UpsertTalentDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  homeCity?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  feeMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  feeMax?: number;

  @IsOptional()
  @IsEnum(TALENT_STATUSES)
  status?: TalentStatus;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
