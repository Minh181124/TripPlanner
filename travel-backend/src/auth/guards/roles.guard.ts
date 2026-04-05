import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard để kiểm tra vai trò (role)
 * Sử dụng: @UseGuards(JwtAuthGuard, RolesGuard)
 *         @Roles('admin', 'local')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.vaitro)) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
    }

    return true;
  }
}
