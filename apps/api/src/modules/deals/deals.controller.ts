import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { DealsService } from "./deals.service";
import { UpdateDealStageDto, UpsertDealDto } from "./dto/deal.dto";

@Controller("deals")
export class DealsController {
  constructor(private readonly deals: DealsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.deals.list(user, query);
  }

  @Get("board")
  board(@CurrentUser() user: AuthUser) {
    return this.deals.board(user);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.deals.get(user, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: UpsertDealDto) {
    return this.deals.create(user, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpsertDealDto,
  ) {
    return this.deals.update(user, id, dto);
  }

  @Patch(":id/stage")
  updateStage(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateDealStageDto,
  ) {
    return this.deals.updateStage(user, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.deals.remove(user, id);
  }
}
