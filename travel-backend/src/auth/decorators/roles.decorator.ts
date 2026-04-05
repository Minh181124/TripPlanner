import { SetMetadata } from '@nestjs/common';

/**
 * Decorator để đặt yêu cầu vai trò cho API endpoint
 * Sử dụng: @Roles('admin', 'local')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
