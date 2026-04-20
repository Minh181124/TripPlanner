import { Injectable, HttpException, HttpStatus, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLichtrinhMauDto, UpdateLichtrinhMauDto, LichtrinhMauPlaceItemDto, LichtrinhMauDayConfigDto } from './dto/create-lichtrinh-mau.dto';

@Injectable()
export class LichtrinhMauService {
  private readonly logger = new Logger(LichtrinhMauService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===================================================================
  // SHARED INCLUDE CONFIG — dùng chung cho các query
  // ===================================================================
  private readonly defaultInclude = {
    lichtrinh_mau_diadiem: {
      include: { diadiem: true },
      orderBy: { thutu: 'asc' as const },
    },
    lichtrinh_mau_ngay: {
      orderBy: { ngay_thu_may: 'asc' as const },
    },
    tuyen_duong: {
      orderBy: { thutu: 'asc' as const },
    },
    sothich: true,
    nguoidung: {
      select: {
        nguoidung_id: true,
        ten: true,
        email: true,
      },
    },
  };

  // ===================================================================
  // CREATE
  // ===================================================================

  /**
   * Tạo lịch trình mẫu (Template) mới với danh sách địa điểm
   * - Admin: trang_thai = APPROVED
   * - Local: trang_thai = PENDING (chờ duyệt)
   */
  async createLichtrinhMau(
    dto: CreateLichtrinhMauDto,
    nguoidung_id: number,
    vaitro: string = 'local',
  ) {
    if (!dto.tieude || !dto.places || dto.places.length === 0) {
      throw new HttpException(
        'Tiêu đề và ít nhất 1 địa điểm là bắt buộc',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Kiểm tra user tồn tại
      const user = await this.prisma.nguoidung.findUnique({
        where: { nguoidung_id },
      });

      if (!user) {
        throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
      }

      const result = await this.prisma.$transaction(async (tx) => {
        // Upsert tất cả các địa điểm
        const upsertedPlaces: any[] = [];
        for (const place of dto.places) {
          const upsertedPlace = await tx.diadiem.upsert({
            where: { google_place_id: place.mapboxPlaceId },
            update: {
              ten: place.ten,
              diachi: place.diachi || null,
              lat: place.lat,
              lng: place.lng,
              ngaycapnhat: new Date(),
            },
            create: {
              google_place_id: place.mapboxPlaceId,
              ten: place.ten,
              diachi: place.diachi || null,
              lat: place.lat,
              lng: place.lng,
              ngaycapnhat: new Date(),
            },
          });
          upsertedPlaces.push(upsertedPlace);
        }

        // Tính tổng khoảng cách và thời gian từ tuyến đường
        let totalDistance = 0;
        let totalTime = 0;
        if (dto.tuyenDuongs && dto.tuyenDuongs.length > 0) {
          for (const tuyen of dto.tuyenDuongs) {
            totalDistance += Number(tuyen.tong_khoangcach) || 0;
            totalTime += tuyen.tong_thoigian || 0;
          }
        }

        // Tạo bản ghi lichtrinh_mau
        const lichtrinh = await tx.lichtrinh_mau.create({
          data: {
            nguoidung_id: user.nguoidung_id,
            tieude: dto.tieude,
            mota: dto.mota || null,
            sothich_id: dto.sothich_id || null,
            thoigian_dukien: dto.thoigian_dukien || null,
            chi_phi_dukien: dto.chi_phi_dukien || null,
            trang_thai: vaitro === 'admin' ? 'APPROVED' : 'PENDING',
            tong_khoangcach: totalDistance || null,
            tong_thoigian: totalTime || null,
            luotthich: 0,
            ngaytao: new Date(),
          },
        });

        // Tạo các bản ghi lichtrinh_mau_diadiem
        const details: any[] = [];
        for (let index = 0; index < upsertedPlaces.length; index++) {
          const place = dto.places[index];
          const upsertedPlace = upsertedPlaces[index];

          const detail = await tx.lichtrinh_mau_diadiem.create({
            data: {
              lichtrinh_mau_id: lichtrinh.lichtrinh_mau_id,
              diadiem_id: upsertedPlace.diadiem_id,
              thutu: index + 1,
              ngay_thu_may: place.ngay_thu_may || 1,
              thoigian_den: null,
              thoiluong: place.thoiluong || null,
              ghichu: place.ghichu || null,
            },
          });
          details.push(detail);
        }

        // Tạo cấu hình mỗi ngày (startLocation, endLocation, startTime)
        if (dto.dayConfigs && Array.isArray(dto.dayConfigs)) {
          for (const dc of dto.dayConfigs) {
            await tx.lichtrinh_mau_ngay.create({
              data: {
                lichtrinh_mau_id: lichtrinh.lichtrinh_mau_id,
                ngay_thu_may: dc.ngay_thu_may,
                gio_batdau: dc.gio_batdau || null,
                diem_batdau_ten: dc.diem_batdau_ten || null,
                diem_batdau_lat: dc.diem_batdau_lat || null,
                diem_batdau_lng: dc.diem_batdau_lng || null,
                diem_ketthuc_ten: dc.diem_ketthuc_ten || null,
                diem_ketthuc_lat: dc.diem_ketthuc_lat || null,
                diem_ketthuc_lng: dc.diem_ketthuc_lng || null,
              },
            });
          }
        }

        // Tạo các bản ghi tuyen_duong
        const routes: any[] = [];
        if (dto.tuyenDuongs && dto.tuyenDuongs.length > 0) {
          for (const tuyen of dto.tuyenDuongs) {
            const route = await tx.tuyen_duong.create({
              data: {
                lichtrinh_mau_id: lichtrinh.lichtrinh_mau_id,
                diadiem_batdau_id: tuyen.diadiem_batdau_id,
                diadiem_ketthuc_id: tuyen.diadiem_ketthuc_id,
                polyline: tuyen.polyline,
                phuongtien: tuyen.phuongtien || 'car',
                tong_khoangcach: tuyen.tong_khoangcach || null,
                tong_thoigian: tuyen.tong_thoigian || null,
                ngay_thu_may: tuyen.ngay_thu_may || 1,
                thutu: tuyen.thutu || null,
                ngaytao: new Date(),
              },
            });
            routes.push(route);
          }
        }

        return lichtrinh;
      });

      return {
        message: vaitro === 'admin'
          ? 'Tạo lịch trình mẫu thành công'
          : 'Đã gửi lịch trình mẫu, vui lòng chờ Admin duyệt',
        data: result,
      };
    } catch (error) {
      this.logger.error('Lỗi tạo lịch trình mẫu:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Lỗi tạo lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===================================================================
  // READ — PUBLIC
  // ===================================================================

  /**
   * Lấy danh sách lịch trình mẫu công khai (chỉ APPROVED)
   */
  async getAllLichtrinhMau(page?: number, limit?: number) {
    try {
      const skip = page && limit ? (page - 1) * limit : 0;
      const take = limit || 10;

      const [itineraries, total] = await Promise.all([
        this.prisma.lichtrinh_mau.findMany({
          where: { trang_thai: 'APPROVED' },
          skip,
          take,
          include: this.defaultInclude,
          orderBy: { ngaytao: 'desc' },
        }),
        this.prisma.lichtrinh_mau.count({ where: { trang_thai: 'APPROVED' } }),
      ]);

      return {
        message: 'Lấy danh sách lịch trình mẫu thành công',
        data: itineraries,
        pagination: {
          total,
          page: page || 1,
          limit: take,
          pages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.logger.error('Lỗi lấy danh sách lịch trình mẫu:', error);
      throw new HttpException(
        'Lỗi lấy danh sách lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy chi tiết lịch trình mẫu theo ID
   */
  async getLichtrinhMauById(id: number) {
    try {
      const itinerary = await this.prisma.lichtrinh_mau.findUnique({
        where: { lichtrinh_mau_id: id },
        include: this.defaultInclude,
      });

      if (!itinerary) {
        throw new HttpException('Lịch trình mẫu không tồn tại', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'Lấy chi tiết lịch trình mẫu thành công',
        data: itinerary,
      };
    } catch (error) {
      this.logger.error('Lỗi lấy chi tiết lịch trình mẫu:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Lỗi lấy chi tiết lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===================================================================
  // READ — MY (Local user)
  // ===================================================================

  /**
   * Lấy danh sách lịch trình mẫu của user hiện tại
   */
  async getMyLichtrinhMau(nguoidung_id: number, page?: number, limit?: number) {
    try {
      const skip = page && limit ? (page - 1) * limit : 0;
      const take = limit || 10;

      const [itineraries, total] = await Promise.all([
        this.prisma.lichtrinh_mau.findMany({
          where: { nguoidung_id },
          skip,
          take,
          include: this.defaultInclude,
          orderBy: { ngaytao: 'desc' },
        }),
        this.prisma.lichtrinh_mau.count({ where: { nguoidung_id } }),
      ]);

      return {
        data: itineraries,
        pagination: {
          total,
          page: page || 1,
          limit: take,
          pages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.logger.error('Lỗi lấy lịch trình mẫu của tôi:', error);
      throw new HttpException(
        'Lỗi lấy lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===================================================================
  // READ — ADMIN
  // ===================================================================

  /**
   * [Admin] Lấy tất cả lịch trình mẫu (filter theo status tuỳ chọn)
   */
  async getAllLichtrinhMauAdmin(page?: number, limit?: number, trang_thai?: string) {
    try {
      const skip = page && limit ? (page - 1) * limit : 0;
      const take = limit || 10;

      const where: any = {};
      if (trang_thai) {
        where.trang_thai = trang_thai;
      }

      const [itineraries, total] = await Promise.all([
        this.prisma.lichtrinh_mau.findMany({
          where,
          skip,
          take,
          include: this.defaultInclude,
          orderBy: { ngaytao: 'desc' },
        }),
        this.prisma.lichtrinh_mau.count({ where }),
      ]);

      return {
        data: itineraries,
        pagination: {
          total,
          page: page || 1,
          limit: take,
          pages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.logger.error('Lỗi lấy danh sách lịch trình mẫu (admin):', error);
      throw new HttpException(
        'Lỗi lấy danh sách: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===================================================================
  // UPDATE
  // ===================================================================

  /**
   * Cập nhật lịch trình mẫu
   * - Admin: giữ nguyên trạng thái
   * - Local: reset trạng thái về PENDING (chờ duyệt lại)
   */
  async updateLichtrinhMau(id: number, dto: UpdateLichtrinhMauDto, userId: number, vaitro: string) {
    try {
      const existing = await this.prisma.lichtrinh_mau.findUnique({
        where: { lichtrinh_mau_id: id },
      });

      if (!existing) {
        throw new NotFoundException('Lịch trình mẫu không tồn tại');
      }

      // Ownership check cho local
      if (vaitro !== 'admin' && existing.nguoidung_id !== userId) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa lịch trình mẫu này');
      }

      const result = await this.prisma.$transaction(async (tx) => {
        // Cập nhật thông tin lịch trình
        const updated = await tx.lichtrinh_mau.update({
          where: { lichtrinh_mau_id: id },
          data: {
            tieude: dto.tieude || existing.tieude,
            mota: dto.mota !== undefined ? dto.mota : existing.mota,
            sothich_id: dto.sothich_id !== undefined ? dto.sothich_id : existing.sothich_id,
            thoigian_dukien: dto.thoigian_dukien !== undefined ? dto.thoigian_dukien : existing.thoigian_dukien,
            chi_phi_dukien: dto.chi_phi_dukien !== undefined ? dto.chi_phi_dukien : existing.chi_phi_dukien,
            // Local sửa → reset PENDING, Admin giữ nguyên
            trang_thai: vaitro === 'admin' ? existing.trang_thai : 'PENDING',
          },
        });

        // Nếu có places mới, xóa cái cũ và thêm mới
        if (dto.places && Array.isArray(dto.places)) {
          await tx.lichtrinh_mau_diadiem.deleteMany({
            where: { lichtrinh_mau_id: id },
          });

          // Upsert địa điểm
          const upsertedPlaces: any[] = [];
          for (const place of dto.places) {
            const upsertedPlace = await tx.diadiem.upsert({
              where: { google_place_id: place.mapboxPlaceId },
              update: {
                ten: place.ten,
                diachi: place.diachi || null,
                lat: place.lat,
                lng: place.lng,
                ngaycapnhat: new Date(),
              },
              create: {
                google_place_id: place.mapboxPlaceId,
                ten: place.ten,
                diachi: place.diachi || null,
                lat: place.lat,
                lng: place.lng,
                ngaycapnhat: new Date(),
              },
            });
            upsertedPlaces.push(upsertedPlace);
          }

          // Tạo bản ghi lichtrinh_mau_diadiem
          for (let index = 0; index < upsertedPlaces.length; index++) {
            const place = dto.places[index];
            const upsertedPlace = upsertedPlaces[index];

            await tx.lichtrinh_mau_diadiem.create({
              data: {
                lichtrinh_mau_id: id,
                diadiem_id: upsertedPlace.diadiem_id,
                thutu: index + 1,
                ngay_thu_may: place.ngay_thu_may || 1,
                thoigian_den: null,
                thoiluong: place.thoiluong || null,
                ghichu: place.ghichu || null,
              },
            });
          }
        }

        // Nếu có dayConfigs mới, xóa cái cũ và thêm mới
        if (dto.dayConfigs && Array.isArray(dto.dayConfigs)) {
          await tx.lichtrinh_mau_ngay.deleteMany({
            where: { lichtrinh_mau_id: id },
          });

          for (const dc of dto.dayConfigs) {
            await tx.lichtrinh_mau_ngay.create({
              data: {
                lichtrinh_mau_id: id,
                ngay_thu_may: dc.ngay_thu_may,
                gio_batdau: dc.gio_batdau || null,
                diem_batdau_ten: dc.diem_batdau_ten || null,
                diem_batdau_lat: dc.diem_batdau_lat || null,
                diem_batdau_lng: dc.diem_batdau_lng || null,
                diem_ketthuc_ten: dc.diem_ketthuc_ten || null,
                diem_ketthuc_lat: dc.diem_ketthuc_lat || null,
                diem_ketthuc_lng: dc.diem_ketthuc_lng || null,
              },
            });
          }
        }

        return updated;
      });

      return {
        message: vaitro === 'admin'
          ? 'Cập nhật lịch trình mẫu thành công'
          : 'Đã cập nhật lịch trình mẫu, vui lòng chờ Admin duyệt lại',
        data: result,
      };
    } catch (error) {
      this.logger.error('Lỗi cập nhật lịch trình mẫu:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Lỗi cập nhật lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===================================================================
  // DELETE
  // ===================================================================

  /**
   * Xóa lịch trình mẫu
   * - Admin: xóa cứng (hard delete)
   * - Local: chuyển trạng thái PENDING_DELETE (chờ admin duyệt xóa)
   */
  async deleteLichtrinhMau(id: number, userId: number, vaitro: string) {
    try {
      const existing = await this.prisma.lichtrinh_mau.findUnique({
        where: { lichtrinh_mau_id: id },
      });

      if (!existing) {
        throw new NotFoundException('Lịch trình mẫu không tồn tại');
      }

      // Ownership check cho local
      if (vaitro !== 'admin' && existing.nguoidung_id !== userId) {
        throw new ForbiddenException('Bạn không có quyền xóa lịch trình mẫu này');
      }

      if (vaitro !== 'admin') {
        // Local → PENDING_DELETE
        await this.prisma.lichtrinh_mau.update({
          where: { lichtrinh_mau_id: id },
          data: { trang_thai: 'PENDING_DELETE' },
        });
        return { message: 'Đã gửi yêu cầu xóa lịch trình mẫu, vui lòng chờ Admin duyệt' };
      }

      // Admin → Hard Delete
      await this.prisma.lichtrinh_mau.delete({
        where: { lichtrinh_mau_id: id },
      });

      return { message: 'Xóa lịch trình mẫu thành công' };
    } catch (error) {
      this.logger.error('Lỗi xóa lịch trình mẫu:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Lỗi xóa lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===================================================================
  // STATUS UPDATE (Admin only)
  // ===================================================================

  /**
   * [Admin] Cập nhật trạng thái lịch trình mẫu (APPROVED / REJECTED)
   * Nếu status = APPROVED và trang_thai hiện tại = PENDING_DELETE → xóa cứng
   */
  async updateStatus(id: number, status: string) {
    try {
      const existing = await this.prisma.lichtrinh_mau.findUnique({
        where: { lichtrinh_mau_id: id },
      });

      if (!existing) {
        throw new NotFoundException('Lịch trình mẫu không tồn tại');
      }

      // Nếu đang PENDING_DELETE và admin duyệt (APPROVED) → xóa cứng
      if (existing.trang_thai === 'PENDING_DELETE' && status === 'APPROVED') {
        await this.prisma.lichtrinh_mau.delete({
          where: { lichtrinh_mau_id: id },
        });
        return { message: 'Đã duyệt yêu cầu xóa và xóa lịch trình mẫu thành công' };
      }

      // Nếu PENDING_DELETE và admin từ chối → giữ lại, chuyển về APPROVED
      if (existing.trang_thai === 'PENDING_DELETE' && status === 'REJECTED') {
        const updated = await this.prisma.lichtrinh_mau.update({
          where: { lichtrinh_mau_id: id },
          data: { trang_thai: 'APPROVED' },
        });
        return { message: 'Đã từ chối yêu cầu xóa, lịch trình mẫu được giữ lại', data: updated };
      }

      // Duyệt hoặc từ chối bình thường
      const updated = await this.prisma.lichtrinh_mau.update({
        where: { lichtrinh_mau_id: id },
        data: { trang_thai: status },
      });

      return {
        message: status === 'APPROVED'
          ? 'Đã duyệt lịch trình mẫu thành công'
          : 'Đã từ chối lịch trình mẫu',
        data: updated,
      };
    } catch (error) {
      this.logger.error('Lỗi cập nhật trạng thái:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Lỗi cập nhật trạng thái: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
