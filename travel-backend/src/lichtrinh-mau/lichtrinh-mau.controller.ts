import { Controller, Post, Get, Put, Delete, Patch, Body, Param, HttpCode, Query, UseGuards } from '@nestjs/common';
import { LichtrinhMauService } from './lichtrinh-mau.service';
import { CreateLichtrinhMauDto, UpdateLichtrinhMauDto } from './dto/create-lichtrinh-mau.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('lichtrinh-mau')
export class LichtrinhMauController {
  constructor(private readonly lichtrinhMauService: LichtrinhMauService) {}

  // ===================================================================
  // ADMIN ENDPOINTS — đặt trước các route có :id để tránh conflict
  // ===================================================================

  /**
   * GET /lichtrinh-mau/admin/all
   * [Admin] Lấy tất cả lịch trình mẫu (filter theo status)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('trang_thai') trang_thai?: string,
  ) {
    return this.lichtrinhMauService.getAllLichtrinhMauAdmin(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      trang_thai || undefined,
    );
  }

  /**
   * PUT /lichtrinh-mau/admin/:id
   * [Admin] Cập nhật lịch trình mẫu toàn quyền (không reset trạng thái)
   */
  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  async updateByAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateLichtrinhMauDto,
    @CurrentUser() user: any,
  ) {
    return this.lichtrinhMauService.updateLichtrinhMau(
      parseInt(id, 10),
      dto,
      user.nguoidung_id,
      'admin',
    );
  }

  /**
   * DELETE /lichtrinh-mau/admin/:id
   * [Admin] Xóa cứng lịch trình mẫu
   */
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  async deleteByAdmin(@Param('id') id: string) {
    return this.lichtrinhMauService.deleteLichtrinhMau(parseInt(id, 10), 0, 'admin');
  }

  /**
   * PATCH /lichtrinh-mau/:id/status
   * [Admin] Duyệt / Từ chối lịch trình mẫu
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.lichtrinhMauService.updateStatus(parseInt(id, 10), status);
  }

  // ===================================================================
  // LOCAL + ADMIN ENDPOINTS
  // ===================================================================

  /**
   * POST /lichtrinh-mau
   * Tạo lịch trình mẫu mới
   * - Admin: trang_thai = APPROVED
   * - Local: trang_thai = PENDING
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'local')
  @HttpCode(201)
  async createLichtrinhMau(
    @Body() dto: CreateLichtrinhMauDto,
    @CurrentUser() user: any,
  ) {
    return this.lichtrinhMauService.createLichtrinhMau(dto, user.nguoidung_id, user.vaitro);
  }

  /**
   * GET /lichtrinh-mau/me
   * Lấy danh sách lịch trình mẫu của user hiện tại
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyLichtrinhMau(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.lichtrinhMauService.getMyLichtrinhMau(
      user.nguoidung_id,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  // ===================================================================
  // PUBLIC ENDPOINTS
  // ===================================================================

  /**
   * GET /lichtrinh-mau
   * Lấy danh sách lịch trình mẫu công khai (chỉ APPROVED)
   */
  @Get()
  async getAllLichtrinhMau(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.lichtrinhMauService.getAllLichtrinhMau(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  /**
   * GET /lichtrinh-mau/:id
   * Lấy chi tiết lịch trình mẫu
   */
  @Get(':id')
  async getLichtrinhMauById(@Param('id') id: string) {
    return this.lichtrinhMauService.getLichtrinhMauById(parseInt(id, 10));
  }

  /**
   * PUT /lichtrinh-mau/:id
   * Cập nhật lịch trình mẫu (owner only, local reset PENDING)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'local')
  @HttpCode(200)
  async updateLichtrinhMau(
    @Param('id') id: string,
    @Body() dto: UpdateLichtrinhMauDto,
    @CurrentUser() user: any,
  ) {
    return this.lichtrinhMauService.updateLichtrinhMau(
      parseInt(id, 10),
      dto,
      user.nguoidung_id,
      user.vaitro,
    );
  }

  /**
   * DELETE /lichtrinh-mau/:id
   * Xóa lịch trình mẫu
   * - Admin: xóa cứng
   * - Local: chuyển PENDING_DELETE
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'local')
  @HttpCode(200)
  async deleteLichtrinhMau(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.lichtrinhMauService.deleteLichtrinhMau(
      parseInt(id, 10),
      user.nguoidung_id,
      user.vaitro,
    );
  }
}
