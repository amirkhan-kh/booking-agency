import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import type { AuthUser } from "@marquee/shared";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto.email, dto.password);
    res.cookie(
      this.auth.refreshCookieName,
      result.refreshToken,
      this.auth.cookieOptions(result.refreshExpires),
    );
    return {
      accessToken: result.accessToken,
      user: result.user,
      organization: result.organization,
    };
  }

  @Public()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[this.auth.refreshCookieName] as string | undefined;
    const result = await this.auth.rotateRefresh(raw ?? "");
    res.cookie(
      this.auth.refreshCookieName,
      result.refreshToken,
      this.auth.cookieOptions(result.refreshExpires),
    );
    return {
      accessToken: result.accessToken,
      user: result.user,
      organization: result.organization,
    };
  }

  @Public()
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[this.auth.refreshCookieName] as string | undefined;
    await this.auth.logout(raw);
    res.clearCookie(this.auth.refreshCookieName, { path: "/api/v1/auth" });
    return { ok: true };
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user);
  }
}
