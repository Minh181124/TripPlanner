import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLichtrinhMauDto, UpdateLichtrinhMauDto, LichtrinhMauPlaceItemDto } from './dto/create-lichtrinh-mau.dto';

@Injectable()
export class LichtrinhMauService {
  private readonly logger = new Logger(LichtrinhMauService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo lịch trình mẫu (Template) mới với danh sách địa điểm
   * 
   * Quy trình:
   * 1. Kiểm tra user tồn tại
   * 2. Upsert các địa điểm vào bảng diadiem
   * 3. Tạo bản ghi lichtrinh_mau
   * 4. Tạo các bản ghi lichtrinh_mau_diadiem với ghichu, thoiluong, ngay_thu_may
   * 5. Tạo các bản ghi tuyen_duong gắn với lichtrinh_mau_id từ DTO tuyenDuongs
   */
  async createLichtrinhMau(
    dto: CreateLichtrinhMauDto,
    nguoidung_id: number = 1, // Tạm thời gán cứng, sau lấy từ Auth
  ) {
    // Validate input
    if (!dto.tieude || !dto.places || dto.places.length === 0) {
      throw new HttpException(
        'Tiêu đề và ít nhất 1 địa điểm là bắt buộc',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // STEP 1: Kiểm tra user tồn tại
      let user = await this.prisma.nguoidung.findUnique({
        where: { nguoidung_id },
      });

      if (!user) {
        this.logger.warn(
          `User ID ${nguoidung_id} không tồn tại. Tạo user test mặc định...`,
        );
        user = await this.prisma.nguoidung.create({
          data: {
            email: `lichtrinh-mau-user-${nguoidung_id}@example.com`,
            matkhau: 'default_password_hash',
            ten: `Lichtrinh Mau User ${nguoidung_id}`,
            vaitro: 'local',
            trangthai: 'active',
          },
        });
        this.logger.debug(`Tạo user test thành công: ${user.nguoidung_id}`);
      }

      // STEP 2: Thực hiện transaction
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

        // STEP 3: Tạo bản ghi lichtrinh_mau
        let totalDistance = 0;
        let totalTime = 0;

        // Calculate totals from tuyen_duongs if provided
        if (dto.tuyenDuongs && dto.tuyenDuongs.length > 0) {
          for (const tuyen of dto.tuyenDuongs) {
            totalDistance += Number(tuyen.tong_khoangcach) || 0;
            totalTime += tuyen.tong_thoigian || 0;
          }
        }

        const lichtrinh = await tx.lichtrinh_mau.create({
          data: {
            nguoidung_id: user.nguoidung_id,
            tieude: dto.tieude,
            mota: dto.mota || null,
            sothich_id: dto.sothich_id || null,
            thoigian_dukien: dto.thoigian_dukien || null,
            tong_khoangcach: totalDistance || null,
            tong_thoigian: totalTime || null,
            luotthich: 0,
            ngaytao: new Date(),
          },
        });

        // STEP 4: Tạo các bản ghi lichtrinh_mau_diadiem
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

        // STEP 5: Tạo các bản ghi tuyen_duong gắn với lichtrinh_mau_id
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

        return {
          lichtrinh_mau_id: lichtrinh.lichtrinh_mau_id,
          tieude: lichtrinh.tieude,
          mota: lichtrinh.mota,
          sothich_id: lichtrinh.sothich_id,
          thoigian_dukien: lichtrinh.thoigian_dukien,
          tong_khoangcach: totalDistance,
          tong_thoigian: totalTime,
          nguoidung_id: lichtrinh.nguoidung_id,
          placesCount: upsertedPlaces.length,
          routesCount: routes.length,
          places: upsertedPlaces.map((p) => ({
            diadiem_id: p.diadiem_id,
            google_place_id: p.google_place_id,
            ten: p.ten,
            lat: p.lat,
            lng: p.lng,
          })),
          details: details.map((d) => ({
            id: d.id,
            thutu: d.thutu,
            ngay_thu_may: d.ngay_thu_may,
            ghichu: d.ghichu,
            thoiluong: d.thoiluong,
          })),
          routes: routes.map((r) => ({
            tuyen_duong_id: r.tuyen_duong_id,
            diadiem_batdau_id: r.diadiem_batdau_id,
            diadiem_ketthuc_id: r.diadiem_ketthuc_id,
            phuongtien: r.phuongtien,
            tong_khoangcach: r.tong_khoangcach,
            tong_thoigian: r.tong_thoigian,
          })),
        };
      });

      return {
        message: 'Tạo lịch trình mẫu thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error('Lỗi tạo lịch trình mẫu:', error);
      throw new HttpException(
        'Lỗi tạo lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách lịch trình mẫu công khai (với phân trang)
   */
  async getAllLichtrinhMau(page?: number, limit?: number) {
    try {
      const skip = page && limit ? (page - 1) * limit : 0;
      const take = limit || 10;

      const [itineraries, total] = await Promise.all([
        this.prisma.lichtrinh_mau.findMany({
          skip,
          take,
          include: {
            lichtrinh_mau_diadiem: {
              include: { diadiem: true },
              orderBy: { thutu: 'asc' },
            },
            tuyen_duong: {
              orderBy: { thutu: 'asc' },
            },
            sothich: true,
            nguoidung: {
              select: {
                nguoidung_id: true,
                ten: true,
                email: true,
              },
            },
          },
          orderBy: { ngaytao: 'desc' },
        }),
        this.prisma.lichtrinh_mau.count(),
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
        include: {
          lichtrinh_mau_diadiem: {
            include: { diadiem: true },
            orderBy: { thutu: 'asc' },
          },
          tuyen_duong: {
            orderBy: { thutu: 'asc' },
          },
          sothich: true,
          nguoidung: {
            select: {
              nguoidung_id: true,
              ten: true,
              email: true,
            },
          },
        },
      });

      if (!itinerary) {
        throw new HttpException(
          'Lịch trình mẫu không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Lấy chi tiết lịch trình mẫu thành công',
        data: itinerary,
      };
    } catch (error) {
      this.logger.error('Lỗi lấy chi tiết lịch trình mẫu:', error);
      throw new HttpException(
        'Lỗi lấy chi tiết lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật lịch trình mẫu
   */
  async updateLichtrinhMau(id: number, dto: UpdateLichtrinhMauDto) {
    try {
      // Kiểm tra lịch trình tồn tại
      const existing = await this.prisma.lichtrinh_mau.findUnique({
        where: { lichtrinh_mau_id: id },
      });

      if (!existing) {
        throw new HttpException(
          'Lịch trình mẫu không tồn tại',
          HttpStatus.NOT_FOUND,
        );
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

        return updated;
      });

      return {
        message: 'Cập nhật lịch trình mẫu thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error('Lỗi cập nhật lịch trình mẫu:', error);
      throw new HttpException(
        'Lỗi cập nhật lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa lịch trình mẫu (cascade delete lichtrinh_mau_diadiem)
   */
  async deleteLichtrinhMau(id: number) {
    try {
      const existing = await this.prisma.lichtrinh_mau.findUnique({
        where: { lichtrinh_mau_id: id },
      });

      if (!existing) {
        throw new HttpException(
          'Lịch trình mẫu không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.lichtrinh_mau.delete({
        where: { lichtrinh_mau_id: id },
      });

      return {
        message: 'Xóa lịch trình mẫu thành công',
      };
    } catch (error) {
      this.logger.error('Lỗi xóa lịch trình mẫu:', error);
      throw new HttpException(
        'Lỗi xóa lịch trình mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
