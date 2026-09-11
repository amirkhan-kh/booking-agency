import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { COMPANY_TYPES, type CompanyType } from "@marquee/shared";

export class UpsertCompanyDto {
  @IsString()
  name!: string;

  @IsEnum(COMPANY_TYPES)
  type!: CompanyType;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
