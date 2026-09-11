import { Body, Controller, Get, Post } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles("OWNER", "ADMIN")
  list(@CurrentUser() user: AuthUser) {
    return this.users.list(user);
  }

  @Post()
  @Roles("OWNER", "ADMIN")
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return this.users.create(user, dto);
  }
}
