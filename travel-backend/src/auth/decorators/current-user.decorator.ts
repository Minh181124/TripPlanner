import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator để lấy người dùng hiện tại từ request
 * Sử dụng: @CurrentUser() user
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
