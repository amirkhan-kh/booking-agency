import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { ROLES, type Role } from "@marquee/shared";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEnum(ROLES)
  role!: Role;
}
