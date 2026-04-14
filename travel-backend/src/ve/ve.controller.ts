import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GeminiService } from './gemini.service';
import { VeService } from './ve.service';
import { CreateVeDto, UpdateVeDto, AttachVeDto } from './dto/ve.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ve')
@UseGuards(JwtAuthGuard)
export class VeController {
  constructor(
    private readonly veService: VeService,
    private readonly geminiService: GeminiService,
  ) {}

  // ── GET /ve?trang_thai=true ──
  @Get()
  async getMyTickets(
    @CurrentUser() user: any,
    @Query('trang_thai') trangThai?: string,
  ) {
    const filter =
      trangThai === 'true' ? true : trangThai === 'false' ? false : undefined;
    return this.veService.getMyTickets(user.nguoidung_id, filter);
  }

  // ── GET /ve/for-itinerary/:lichtrinhId ──
  // Phải đặt TRƯỚC route :id để tránh conflict
  @Get('for-itinerary/:lichtrinhId')
  async getTicketsForItinerary(
    @Param('lichtrinhId', ParseIntPipe) lichtrinhId: number,
    @CurrentUser() user: any,
  ) {
    return this.veService.getTicketsForItinerary(lichtrinhId, user.nguoidung_id);
  }

  // ── POST /ve ── (multipart/form-data)
  @Post()
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Chỉ hỗ trợ PDF và ảnh (JPG, PNG, WEBP)'), false);
        }
      },
    }),
  )
  async createTicket(
    @CurrentUser() user: any,
    @Body() dto: CreateVeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.veService.createTicket(user.nguoidung_id, dto, file);
  }

  // ── POST /ve/extract-ai ──
  @Post('extract-ai')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB cho AI
    }),
  )
  async extractTicketAI(
    @Body('text') text?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      return this.geminiService.extractTicketInfo({
        buffer: file.buffer,
        mimeType: file.mimetype,
      });
    } else if (text) {
      return this.geminiService.extractTicketInfo({ text });
    }
    return { error: 'Vui lòng cung cấp file hoặc text.' };
  }

  // ── PATCH /ve/:id ──
  @Patch(':id')
  async updateTicket(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UpdateVeDto,
  ) {
    return this.veService.updateTicket(user.nguoidung_id, id, dto);
  }

  // ── DELETE /ve/:id ──
  @Delete(':id')
  @HttpCode(200)
  async deleteTicket(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.veService.deleteTicket(user.nguoidung_id, id);
  }

  // ── POST /ve/attach ──
  @Post('attach')
  @HttpCode(201)
  async attachTicket(@CurrentUser() user: any, @Body() dto: AttachVeDto) {
    return this.veService.attachTicket(user.nguoidung_id, dto);
  }

  // ── DELETE /ve/attach/:attachId ──
  @Delete('attach/:attachId')
  @HttpCode(200)
  async detachTicket(
    @Param('attachId', ParseIntPipe) attachId: number,
    @CurrentUser() user: any,
  ) {
    return this.veService.detachTicket(user.nguoidung_id, attachId);
  }
}
