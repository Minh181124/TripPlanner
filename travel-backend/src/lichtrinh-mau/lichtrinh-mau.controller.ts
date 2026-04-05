import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, Query } from '@nestjs/common';
import { LichtrinhMauService } from './lichtrinh-mau.service';
import { CreateLichtrinhMauDto, UpdateLichtrinhMauDto } from './dto/create-lichtrinh-mau.dto';

@Controller('lichtrinh-mau')
export class LichtrinhMauController {
  constructor(private readonly lichtrinhMauService: LichtrinhMauService) {}

  /**
   * POST /lichtrinh-mau
   * Tạo lịch trình mẫu (Template) mới
   */
  @Post()
  @HttpCode(201)
  async createLichtrinhMau(@Body() dto: CreateLichtrinhMauDto) {
    return this.lichtrinhMauService.createLichtrinhMau(dto);
  }

  /**
   * GET /lichtrinh-mau
   * Lấy danh sách lịch trình mẫu công khai
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
   * Cập nhật lịch trình mẫu
   */
  @Put(':id')
  @HttpCode(200)
  async updateLichtrinhMau(
    @Param('id') id: string,
    @Body() dto: UpdateLichtrinhMauDto,
  ) {
    return this.lichtrinhMauService.updateLichtrinhMau(parseInt(id, 10), dto);
  }

  /**
   * DELETE /lichtrinh-mau/:id
   * Xóa lịch trình mẫu
   */
  @Delete(':id')
  @HttpCode(200)
  async deleteLichtrinhMau(@Param('id') id: string) {
    return this.lichtrinhMauService.deleteLichtrinhMau(parseInt(id, 10));
  }
}
