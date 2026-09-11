import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import type { AuthUser } from "@marquee/shared";
import { PrismaService } from "../../prisma/prisma.service";
import type { AccessTokenPayload } from "./jwt.strategy";

const REFRESH_COOKIE = "marquee_refresh";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  get refreshCookieName() {
    return REFRESH_COOKIE;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), isActive: true },
      include: { organization: true },
    });
    if (!user) throw new UnauthorizedException("Invalid email or password");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Invalid email or password");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const authUser = this.toAuthUser(user);
    const accessToken = await this.signAccess(authUser);
    const refresh = await this.issueRefresh(user.id);

    return {
      accessToken,
      user: authUser,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        timezone: user.organization.timezone,
        currency: user.organization.currency,
      },
      refreshToken: refresh.raw,
      refreshExpires: refresh.expiresAt,
    };
  }

  async rotateRefresh(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { organization: true } } },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }
    if (!stored.user.isActive) {
      throw new UnauthorizedException("Account disabled");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const authUser = this.toAuthUser(stored.user);
    const accessToken = await this.signAccess(authUser);
    const refresh = await this.issueRefresh(stored.userId);

    return {
      accessToken,
      user: authUser,
      organization: {
        id: stored.user.organization.id,
        name: stored.user.organization.name,
        slug: stored.user.organization.slug,
        timezone: stored.user.organization.timezone,
        currency: stored.user.organization.currency,
      },
      refreshToken: refresh.raw,
      refreshExpires: refresh.expiresAt,
    };
  }

  async logout(rawToken: string | undefined) {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(user: AuthUser) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: user.organizationId },
    });
    return {
      user,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        timezone: organization.timezone,
        currency: organization.currency,
      },
    };
  }

  cookieOptions(expires: Date) {
    const isProd = this.config.get("NODE_ENV") === "production";
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      path: "/api/v1/auth",
      expires,
    };
  }

  private async signAccess(user: AuthUser) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      org: user.organizationId,
      role: user.role,
    };
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get("JWT_ACCESS_TTL", "15m"),
    });
  }

  private async issueRefresh(userId: string) {
    const raw = randomBytes(48).toString("hex");
    const ttl = this.config.get("JWT_REFRESH_TTL", "7d");
    const expiresAt = this.ttlToDate(ttl);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(raw),
        expiresAt,
      },
    });
    return { raw, expiresAt };
  }

  private hashToken(raw: string) {
    return createHash("sha256").update(raw).digest("hex");
  }

  private ttlToDate(ttl: string) {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    const amount = match ? Number(match[1]) : 7;
    const unit = match?.[2] ?? "d";
    const ms =
      unit === "s"
        ? amount * 1000
        : unit === "m"
          ? amount * 60_000
          : unit === "h"
            ? amount * 3_600_000
            : amount * 86_400_000;
    return new Date(Date.now() + ms);
  }

  private toAuthUser(user: {
    id: string;
    organizationId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: AuthUser["role"];
  }): AuthUser {
    return {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
