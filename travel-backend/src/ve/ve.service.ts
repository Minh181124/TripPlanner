import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { CreateVeDto, UpdateVeDto, AttachVeDto } from './dto/ve.dto';

@Injectable()
export class VeService {
  private readonly logger = new Logger(VeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Kho vé CRUD
  // ─────────────────────────────────────────────────────────────────────────

  async getMyTickets(userId: number, trangThai?: boolean) {
    try {
      const where: any = { nguoidung_id: userId };
      if (trangThai !== undefined) where.trang_thai = trangThai;

      const tickets = await this.prisma.ve_nguoidung.findMany({
        where,
        include: {
          ve_diadiem: {
            include: {
              lichtrinh_nguoidung_diadiem: {
                include: {
                  lichtrinh_nguoidung: {
                    select: {
                      lichtrinh_nguoidung_id: true,
                      tieude: true,
                    },
                  },
                  diadiem: {
                    select: {
                      ten: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { ngaytao: 'desc' },
      });

      // Format lại dữ liệu trả về cho gọn
      return tickets.map((t) => {
        const attachedTrips = (t as any).ve_diadiem?.map((vdl: any) => {
          if (!vdl.lichtrinh_nguoidung_diadiem?.lichtrinh_nguoidung) return null;
          return {
            lichtrinh_id: vdl.lichtrinh_nguoidung_diadiem.lichtrinh_nguoidung.lichtrinh_nguoidung_id,
            tieude: vdl.lichtrinh_nguoidung_diadiem.lichtrinh_nguoidung.tieude,
            diadiem_ten: vdl.lichtrinh_nguoidung_diadiem.diadiem?.ten || 'Không xác định',
          };
        }).filter(Boolean) || [];
        
        // Loại bỏ trùng lặp nếu 1 vé gắn vào nhiều địa điểm trong cùng 1 chuyến
        const uniqueTrips = Array.from(new Map(attachedTrips.map((item: any) => [item.lichtrinh_id, item])).values());

        const { ve_diadiem, ...rest } = t as any;
        return {
          ...rest,
          attachedTrips: uniqueTrips,
        };
      });
    } catch (error) {
      this.logger.error('Lỗi lấy kho vé:', error);
      throw new HttpException('Lỗi lấy kho vé: ' + (error as any).message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createTicket(
    userId: number,
    dto: CreateVeDto,
    file?: Express.Multer.File,
  ) {
    this.logger.log(`Creating ticket for user ${userId}: ${JSON.stringify(dto)}`);
    if (file) {
      this.logger.log(`File received: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
    } else {
      this.logger.log('No file received for this ticket.');
    }

    try {
      let file_url: string | undefined;
      let kieu_file: string | undefined;
      let cloudinary_id: string | undefined;

      if (file) {
        this.logger.log('Uploading to Cloudinary...');
        const result = await this.cloudinary.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          userId,
        );
        file_url = result.file_url;
        kieu_file = result.kieu_file;
        cloudinary_id = result.cloudinary_id;
        this.logger.log(`Cloudinary result: ${file_url}`);
      }

      this.logger.log('Saving to Database via Prisma...');
      const ticket = await this.prisma.ve_nguoidung.create({
        data: {
          nguoidung_id: userId,
          tieu_de: dto.tieu_de,
          loai_ve: dto.loai_ve || null,
          ngay_su_dung: dto.ngay_su_dung ? new Date(dto.ngay_su_dung) : null,
          ghi_chu: dto.ghi_chu || null,
          chi_tiet: dto.chi_tiet ? (typeof dto.chi_tiet === 'string' ? JSON.parse(dto.chi_tiet) : dto.chi_tiet) : null,
          file_url: file_url || null,
          kieu_file: kieu_file || null,
          cloudinary_id: cloudinary_id || null,
        },
      });

      this.logger.log(`Ticket created successfully in DB: ${ticket.ve_id}`);
      return ticket;
    } catch (error) {
      this.logger.error('Lỗi tạo vé (Full Error):', error);
      if (error instanceof Error) {
        this.logger.error('Stack trace:', error.stack);
      }
      throw new HttpException(
        'Lỗi tạo vé: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateTicket(userId: number, veId: number, dto: UpdateVeDto) {
    this.logger.log(`Updating ticket ${veId} for user ${userId}. DTO: ${JSON.stringify(dto)}`);
    try {
      const ticket = await this.prisma.ve_nguoidung.findFirst({
        where: { ve_id: veId, nguoidung_id: userId },
      });
      if (!ticket) {
        this.logger.warn(`Ticket ${veId} not found for user ${userId}`);
        throw new HttpException('Vé không tồn tại', HttpStatus.NOT_FOUND);
      }

      const updated = await this.prisma.ve_nguoidung.update({
        where: { ve_id: veId },
        data: {
          tieu_de: dto.tieu_de !== undefined ? dto.tieu_de : ticket.tieu_de,
          loai_ve: dto.loai_ve !== undefined ? dto.loai_ve : ticket.loai_ve,
          ngay_su_dung: dto.ngay_su_dung !== undefined 
            ? (dto.ngay_su_dung && !isNaN(new Date(dto.ngay_su_dung).getTime()) 
                ? new Date(dto.ngay_su_dung) 
                : null) 
            : ticket.ngay_su_dung,
          ghi_chu: dto.ghi_chu !== undefined ? dto.ghi_chu : ticket.ghi_chu,
          chi_tiet: dto.chi_tiet !== undefined ? (typeof dto.chi_tiet === 'string' ? JSON.parse(dto.chi_tiet) : dto.chi_tiet) : ticket.chi_tiet,
          trang_thai: dto.trang_thai !== undefined ? dto.trang_thai : ticket.trang_thai,
        },
      });

      this.logger.log(`Ticket ${veId} updated successfully`);
      return updated;
    } catch (error) {
      this.logger.error('Lỗi cập nhật vé:', error);
      throw new HttpException(
        'Lỗi cập nhật vé: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteTicket(userId: number, veId: number) {
    try {
      const ticket = await this.prisma.ve_nguoidung.findFirst({
        where: { ve_id: veId, nguoidung_id: userId },
      });
      if (!ticket) {
        throw new HttpException('Vé không tồn tại', HttpStatus.NOT_FOUND);
      }

      // Xóa file trên Cloudinary nếu có
      if (ticket.cloudinary_id) {
        await this.cloudinary.deleteFile(ticket.cloudinary_id, ticket.kieu_file);
      }

      await this.prisma.ve_nguoidung.delete({ where: { ve_id: veId } });

      return { success: true };
    } catch (error) {
      this.logger.error('Lỗi xóa vé:', error);
      throw new HttpException(
        'Lỗi xóa vé: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Attach / Detach vé vào địa điểm
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Lấy TẤT CẢ vé đã attach trong 1 lịch trình — 1 call duy nhất.
   * Trả về map: { [lichtrinh_nguoidung_diadiem_id]: AttachedTicket[] }
   */
  async getTicketsForItinerary(lichtrinhId: number, userId: number) {
    try {
      const rows = await this.prisma.ve_diadiem_lichtrinh.findMany({
        where: {
          lichtrinh_nguoidung_diadiem: {
            lichtrinh_nguoidung_id: lichtrinhId,
          },
          ve: {
            nguoidung_id: userId,
          },
        },
        include: {
          ve: true,
        },
      });

      // Build map
      const map: Record<number, any[]> = {};
      for (const row of rows) {
        const key = row.lichtrinh_nguoidung_diadiem_id;
        if (!map[key]) map[key] = [];
        map[key].push({
          attachId: row.id,
          ve_id: row.ve_id,
          tieu_de: row.ve.tieu_de,
          loai_ve: row.ve.loai_ve,
          file_url: row.ve.file_url,
          kieu_file: row.ve.kieu_file,
          ngay_su_dung: row.ve.ngay_su_dung,
        });
      }

      return map;
    } catch (error) {
      this.logger.error('Lỗi lấy vé lịch trình:', error);
      throw new HttpException(
        'Lỗi lấy vé: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async attachTicket(userId: number, dto: AttachVeDto) {
    this.logger.log(`Attaching ticket ${dto.ve_id} to place_junction ${dto.lichtrinh_nguoidung_diadiem_id} for user ${userId}`);
    try {
      // Kiểm tra vé thuộc user
      const ticket = await this.prisma.ve_nguoidung.findFirst({
        where: { ve_id: dto.ve_id, nguoidung_id: userId },
      });
      if (!ticket) {
        this.logger.warn(`Ticket ${dto.ve_id} not found or doesn't belong to user ${userId}`);
        throw new HttpException('Vé không tồn tại', HttpStatus.NOT_FOUND);
      }

      // Kiểm tra đã attach chưa
      const existing = await this.prisma.ve_diadiem_lichtrinh.findFirst({
        where: {
          ve_id: dto.ve_id,
          lichtrinh_nguoidung_diadiem_id: dto.lichtrinh_nguoidung_diadiem_id,
        },
      });
      if (existing) {
        this.logger.log('Ticket already attached, returning existing record');
        return existing; // idempotent
      }

      const attach = await this.prisma.ve_diadiem_lichtrinh.create({
        data: {
          ve_id: dto.ve_id,
          lichtrinh_nguoidung_diadiem_id: dto.lichtrinh_nguoidung_diadiem_id,
        },
      });

      this.logger.log(`Successfully attached ticket ${dto.ve_id} (AttachID: ${attach.id})`);
      return attach;
    } catch (error) {
      this.logger.error('Lỗi khi gán vé:', error);
      throw new HttpException(
        'Lỗi attach vé: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async detachTicket(userId: number, attachId: number) {
    try {
      const attach = await this.prisma.ve_diadiem_lichtrinh.findFirst({
        where: { id: attachId },
        include: { ve: true },
      });

      if (!attach || attach.ve.nguoidung_id !== userId) {
        throw new HttpException('Không tìm thấy bản ghi', HttpStatus.NOT_FOUND);
      }

      await this.prisma.ve_diadiem_lichtrinh.delete({ where: { id: attachId } });

      return { success: true };
    } catch (error) {
      this.logger.error('Lỗi detach vé:', error);
      throw new HttpException(
        'Lỗi gỡ vé: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
