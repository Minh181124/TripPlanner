import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, Query, UseGuards } from '@nestjs/common';
import { LichtrinhNguoidungService } from './lichtrinh-nguoidung.service';
import { CreateLichtrinhNguoidungDto, UpdateLichtrinhNguoidungDto } from './dto/create-lichtrinh-nguoidung.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('lichtrinh-nguoidung')
@UseGuards(JwtAuthGuard)
export class LichtrinhNguoidungController {
  constructor(private readonly lichtrinhNguoidungService: LichtrinhNguoidungService) {}

  /**
   * ===== ADMIN ENDPOINTS =====
   * Đặt trước các route có :id để tránh conflict
   */

  /**
   * GET /lichtrinh-nguoidung/admin/user/:userId
   * [Admin] Lấy danh sách lịch trình của bất kỳ user nào
   */
  @Get('admin/user/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getByUserAdmin(@Param('userId') userId: string) {
    return this.lichtrinhNguoidungService.getLichtrinhByUserAdmin(parseInt(userId, 10));
  }

  /**
   * GET /lichtrinh-nguoidung/admin/:id
   * [Admin] Lấy chi tiết lịch trình (bỏ qua ownership)
   */
  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getByIdAdmin(@Param('id') id: string) {
    return this.lichtrinhNguoidungService.getLichtrinhByIdAdmin(parseInt(id, 10));
  }

  /**
   * ===== USER ENDPOINTS =====
   */

  /**
   * POST /lichtrinh-nguoidung/from-sample/:sampleId
   * Tạo lịch trình cá nhân từ lịch trình mẫu (Deep copy)
   * Sao chép tất cả dữ liệu: địa điểm, ngày, tuyến đường
   */
  @Post('from-sample/:sampleId')
  @HttpCode(201)
  async createLichtrinhNguoidungFromSample(
    @Param('sampleId') sampleId: string,
    @CurrentUser() user: any,
  ) {
    return this.lichtrinhNguoidungService.createLichtrinhNguoidungFromSample(
      parseInt(sampleId, 10),
      user.nguoidung_id,
    );
  }

  /**
   * POST /lichtrinh-nguoidung
   * Tạo lịch trình cá nhân mới
   */
  @Post()
  @HttpCode(201)
  async createLichtrinhNguoidung(
    @Body() dto: CreateLichtrinhNguoidungDto,
    @CurrentUser() user: any,
  ) {
    return this.lichtrinhNguoidungService.createLichtrinhNguoidung(dto, user.nguoidung_id);
  }

  /**
   * GET /lichtrinh-nguoidung/user/:userId
   * Lấy danh sách lịch trình cá nhân của user
   */
  @Get('user/:userId')
  async getLichtrinhNguoidungByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.lichtrinhNguoidungService.getLichtrinhNguoidungByUser(
      parseInt(userId, 10),
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  /**
   * GET /lichtrinh-nguoidung/:id
   * Lấy chi tiết lịch trình cá nhân
   */
  @Get(':id')
  async getLichtrinhNguoidungById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lichtrinhNguoidungService.getLichtrinhNguoidungById(parseInt(id, 10), user.nguoidung_id);
  }

  /**
   * PUT /lichtrinh-nguoidung/:id
   * Cập nhật lịch trình cá nhân
   */
  @Put(':id')
  @HttpCode(200)
  async updateLichtrinhNguoidung(
    @Param('id') id: string,
    @Body() dto: UpdateLichtrinhNguoidungDto,
    @CurrentUser() user: any,
  ) {
    return this.lichtrinhNguoidungService.updateLichtrinhNguoidung(parseInt(id, 10), dto, user.nguoidung_id);
  }

  /**
   * DELETE /lichtrinh-nguoidung/:id
   * Xóa lịch trình cá nhân
   */
  @Delete(':id')
  @HttpCode(200)
  async deleteLichtrinhNguoidung(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lichtrinhNguoidungService.deleteLichtrinhNguoidung(parseInt(id, 10), user.nguoidung_id);
  }
}
