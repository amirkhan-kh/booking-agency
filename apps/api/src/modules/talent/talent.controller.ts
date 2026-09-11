import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { UpsertTalentDto } from "./dto/talent.dto";
import { TalentService } from "./talent.service";

@Controller("talent")
export class TalentController {
  constructor(private readonly talent: TalentService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.talent.list(user, query);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.talent.get(user, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: UpsertTalentDto) {
    return this.talent.create(user, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpsertTalentDto,
  ) {
    return this.talent.update(user, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.talent.remove(user, id);
  }
}
