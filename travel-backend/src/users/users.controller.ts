import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto, UpdateUserByAdminDto, UserResponseDto, PaginatedUsersDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * ===== USER PROFILE API =====
   */

  /**
   * GET /users/profile
   * Lấy thông tin profile của chính người dùng đang đăng nhập
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.nguoidung_id);
  }

  /**
   * PATCH /users/profile
   * Cập nhật thông tin cá nhân (ten, avatar, sdt, diachi)
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.nguoidung_id, updateProfileDto);
  }

  /**
   * PATCH /users/profile/change-password
   * Đổi mật khẩu
   */
  @Patch('profile/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(user.nguoidung_id, changePasswordDto);
  }

  /**
   * ===== ADMIN API =====
   */

  /**
   * GET /users/admin/all
   * Lấy danh sách toàn bộ người dùng (Admin only)
   * Query params: page (default: 1), limit (default: 10)
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<PaginatedUsersDto> {
    return this.usersService.getAllUsers(page, limit);
  }

  /**
   * PATCH /users/admin/:id
   * Cập nhật thông tin người dùng (Admin only)
   * Có thể thay đổi vai trò hoặc trạng thái tài khoản
   */
  @Patch('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async updateUserByAdmin(
    @Param('id', ParseIntPipe) userId: number,
    @CurrentUser() admin,
    @Body() updateUserByAdminDto: UpdateUserByAdminDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserByAdmin(userId, admin.nguoidung_id, updateUserByAdminDto);
  }

  /**
   * DELETE /users/admin/:id
   * Xóa tài khoản người dùng (Admin only)
   */
  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async deleteUserByAdmin(
    @Param('id', ParseIntPipe) userId: number,
    @CurrentUser() admin,
  ): Promise<{ message: string }> {
    return this.usersService.deleteUserByAdmin(userId, admin.nguoidung_id);
  }
}
