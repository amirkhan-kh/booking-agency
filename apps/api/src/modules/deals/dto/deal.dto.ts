import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { DEAL_STAGES, type DealStage } from "@marquee/shared";

export class UpsertDealDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsEnum(DEAL_STAGES)
  stage?: DealStage;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsDateString()
  expectedClose?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  talentId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDealStageDto {
  @IsEnum(DEAL_STAGES)
  stage!: DealStage;
}
