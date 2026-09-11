import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { AuthUser } from "@marquee/shared";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { Reflector } from "@nestjs/core";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

@Injectable()
export class WriteAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      method: string;
      user?: AuthUser;
      path: string;
    }>();

    if (!WRITE_METHODS.has(request.method)) return true;
    const user = request.user;
    if (!user) return false;
    if (user.role === "VIEWER") return false;
    if (user.role === "FINANCE") {
      return request.path.includes("/invoices") || request.path.includes("/auth/");
    }
    return true;
  }
}
