import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto, UpdateUserByAdminDto, UserResponseDto, PaginatedUsersDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * ===== USER PROFILE API =====
   */

  /**
   * Lấy thông tin profile của chính người dùng đang đăng nhập
   */
  async getProfile(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.nguoidung.findUnique({
      where: { nguoidung_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return this.mapUserToResponse(user);
  }

  /**
   * Cập nhật thông tin cá nhân (không được phép đổi email, mật khẩu, vai trò)
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.prisma.nguoidung.findUnique({
      where: { nguoidung_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const updatedUser = await this.prisma.nguoidung.update({
      where: { nguoidung_id: userId },
      data: {
        ten: updateProfileDto.ten ?? user.ten,
        avatar: updateProfileDto.avatar ?? user.avatar,
        sdt: updateProfileDto.sdt ?? user.sdt,
        diachi: updateProfileDto.diachi ?? user.diachi,
        ngaycapnhat: new Date(),
      },
    });

    return this.mapUserToResponse(updatedUser);
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.nguoidung.findUnique({
      where: { nguoidung_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Xác minh mật khẩu cũ
    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.matkhau);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Cập nhật mật khẩu
    await this.prisma.nguoidung.update({
      where: { nguoidung_id: userId },
      data: {
        matkhau: hashedNewPassword,
        ngaycapnhat: new Date(),
      },
    });

    return { message: 'Mật khẩu đã được cập nhật thành công' };
  }

  /**
   * ===== ADMIN API =====
   */

  /**
   * Lấy danh sách Local Guides (Admin)
   */
  async getLocalUsers(): Promise<UserResponseDto[]> {
    const users = await this.prisma.nguoidung.findMany({
      where: { vaitro: 'local' },
      orderBy: { ngaytao: 'desc' },
    });
    return users.map(u => this.mapUserToResponse(u));
  }

  /**
   * Lấy danh sách toàn bộ người dùng (có phân trang)
   */
  async getAllUsers(page: number = 1, limit: number = 10): Promise<PaginatedUsersDto> {
    // Tính toán offset
    const skip = (page - 1) * limit;

    // Lấy danh sách người dùng
    const users = await this.prisma.nguoidung.findMany({
      take: limit,
      skip,
      orderBy: { ngaytao: 'desc' },
    });

    // Lấy tổng số người dùng
    const total = await this.prisma.nguoidung.count();

    // Tính số trang
    const pages = Math.ceil(total / limit);

    return {
      data: users.map(user => this.mapUserToResponse(user)),
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * Cập nhật thông tin người dùng (Admin)
   * Có thể thay đổi vai trò hoặc trạng thái tài khoản
   */
  async updateUserByAdmin(
    userId: number,
    adminId: number,
    updateUserByAdminDto: UpdateUserByAdminDto,
  ): Promise<UserResponseDto> {
    // Kiểm tra người dùng cần cập nhật tồn tại
    const targetUser = await this.prisma.nguoidung.findUnique({
      where: { nguoidung_id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Không cho phép admin cập nhật chính mình bằng endpoint này
    if (userId === adminId) {
      throw new ForbiddenException('Bạn không thể cập nhật thông tin của chính mình bằng endpoint này');
    }

    // Cập nhật thông tin
    const updatedUser = await this.prisma.nguoidung.update({
      where: { nguoidung_id: userId },
      data: {
        vaitro: updateUserByAdminDto.vaitro ?? targetUser.vaitro,
        trangthai: updateUserByAdminDto.trangthai ?? targetUser.trangthai,
        ngaycapnhat: new Date(),
      },
    });

    return this.mapUserToResponse(updatedUser);
  }

  /**
   * Xóa tài khoản người dùng (Admin)
   */
  async deleteUserByAdmin(userId: number, adminId: number): Promise<{ message: string }> {
    // Kiểm tra người dùng cần xóa tồn tại
    const targetUser = await this.prisma.nguoidung.findUnique({
      where: { nguoidung_id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Không cho phép admin xóa chính mình
    if (userId === adminId) {
      throw new ForbiddenException('Bạn không thể xóa tài khoản của chính mình');
    }

    // Xóa tất cả dữ liệu liên quan trước
    // Xóa lịch sử địa điểm
    await this.prisma.hoatdong_diadiem.deleteMany({
      where: { nguoidung_id: userId },
    });

    // Xóa địa điểm đã lưu
    await this.prisma.luu_diadiem.deleteMany({
      where: { nguoidung_id: userId },
    });

    // Xóa đánh giá
    await this.prisma.danhgia_diadiem.deleteMany({
      where: { nguoidung_id: userId },
    });

    // Xóa sở thích người dùng
    await this.prisma.nguoidung_sothich.deleteMany({
      where: { nguoidung_id: userId },
    });

    // Xóa lịch trình mẫu
    await this.prisma.lichtrinh_mau.deleteMany({
      where: { nguoidung_id: userId },
    });

    // Xóa lịch trình cá nhân
    await this.prisma.lichtrinh_nguoidung.deleteMany({
      where: { nguoidung_id: userId },
    });

    // Xóa người dùng
    await this.prisma.nguoidung.delete({
      where: { nguoidung_id: userId },
    });

    return { message: 'Người dùng đã được xóa thành công' };
  }

  /**
   * Helper: Map user entity to response DTO
   */
  private mapUserToResponse(user: any): UserResponseDto {
    return new UserResponseDto(user);
  }
}
