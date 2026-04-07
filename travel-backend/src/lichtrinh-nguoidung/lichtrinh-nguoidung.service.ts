import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLichtrinhNguoidungDto, UpdateLichtrinhNguoidungDto, LichtrinhNguoidungPlaceItemDto } from './dto/create-lichtrinh-nguoidung.dto';

@Injectable()
export class LichtrinhNguoidungService {
  private readonly logger = new Logger(LichtrinhNguoidungService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo lịch trình cá nhân (Personal Trip) mới
   * 
   * Quy trình:
   * 1. Kiểm tra user tồn tại
   * 2. Upsert các địa điểm vào bảng diadiem
   * 3. Tạo bản ghi lichtrinh_nguoidung
   * 4. Tạo các bản ghi lichtrinh_nguoidung_diadiem
   */
  async createLichtrinhNguoidung(
    dto: CreateLichtrinhNguoidungDto,
    nguoidung_id: number = 1,
  ) {
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
        this.logger.warn(`User ID ${nguoidung_id} không tồn tại. Tạo user test...`);
        user = await this.prisma.nguoidung.create({
          data: {
            email: `lichtrinh-nguoidung-user-${nguoidung_id}@example.com`,
            matkhau: 'default_password_hash',
            ten: `Lichtrinh Nguoidung User ${nguoidung_id}`,
            trangthai: 'active',
          },
        });
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

        // STEP 3: Tạo bản ghi lichtrinh_nguoidung
        const parsedStartDate = dto.ngaybatdau 
          ? new Date(dto.ngaybatdau)
          : null;
        const parsedEndDate = dto.ngayketthuc 
          ? new Date(dto.ngayketthuc)
          : null;

        const lichtrinh = await tx.lichtrinh_nguoidung.create({
          data: {
            nguoidung_id: user.nguoidung_id,
            tieude: dto.tieude,
            ngaybatdau: parsedStartDate,
            ngayketthuc: parsedEndDate,
            trangthai: dto.trangthai || 'planning',
            ngaytao: new Date(),
          },
        });

        // STEP 4: Tạo các bản ghi lichtrinh_nguoidung_diadiem
        const details: any[] = [];
        for (let index = 0; index < upsertedPlaces.length; index++) {
          const place = dto.places[index];
          const upsertedPlace = upsertedPlaces[index];

          const detail = await tx.lichtrinh_nguoidung_diadiem.create({
            data: {
              lichtrinh_nguoidung_id: lichtrinh.lichtrinh_nguoidung_id,
              diadiem_id: upsertedPlace.diadiem_id,
              thutu: index + 1,
              ngay_thu_may: place.ngay_thu_may || 1,
              thoigian_den: place.thoigian_den
                ? (() => { const [h, m] = place.thoigian_den.split(':'); const d = new Date(0); d.setUTCHours(+h, +m, 0, 0); return d; })()
                : null,
              thoiluong: place.thoiluong || null,
              ghichu: place.ghichu || null,
            },
          });
          details.push(detail);
        }

        // STEP 5: Tạo cấu hình mỗi ngày (startLocation, endLocation, startTime)
        if (dto.dayConfigs && Array.isArray(dto.dayConfigs)) {
          for (const dc of dto.dayConfigs) {
            await tx.lichtrinh_nguoidung_ngay.create({
              data: {
                lichtrinh_nguoidung_id: lichtrinh.lichtrinh_nguoidung_id,
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

        return {
          lichtrinh_nguoidung_id: lichtrinh.lichtrinh_nguoidung_id,
          tieude: lichtrinh.tieude,
          ngaybatdau: lichtrinh.ngaybatdau,
          ngayketthuc: lichtrinh.ngayketthuc,
          trangthai: lichtrinh.trangthai,
          nguoidung_id: lichtrinh.nguoidung_id,
          placesCount: upsertedPlaces.length,
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
        };
      });

      return result;
    } catch (error) {
      this.logger.error('Lỗi tạo lịch trình cá nhân:', error);
      throw new HttpException(
        'Lỗi tạo lịch trình cá nhân: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách lịch trình cá nhân của user
   */
  async getLichtrinhNguoidungByUser(
    nguoidung_id: number,
    page?: number,
    limit?: number,
  ) {
    try {
      const skip = page && limit ? (page - 1) * limit : 0;
      const take = limit || 10;

      const [itineraries, total] = await Promise.all([
        this.prisma.lichtrinh_nguoidung.findMany({
          where: { nguoidung_id },
          skip,
          take,
          include: {
            lichtrinh_nguoidung_diadiem: {
              include: { diadiem: true },
              orderBy: { thutu: 'asc' },
            },
            lichtrinh_nguoidung_ngay: {
              orderBy: { ngay_thu_may: 'asc' },
            },
            nguoidung: {
              select: {
                nguoidung_id: true,
                ten: true,
              },
            },
          },
          orderBy: { ngaytao: 'desc' },
        }),
        this.prisma.lichtrinh_nguoidung.count({
          where: { nguoidung_id },
        }),
      ]);

      return {
        itineraries,
        pagination: {
          total,
          page: page || 1,
          limit: take,
          pages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.logger.error('Lỗi lấy danh sách lịch trình cá nhân:', error);
      throw new HttpException(
        'Lỗi lấy danh sách lịch trình cá nhân: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy chi tiết lịch trình cá nhân
   */
  async getLichtrinhNguoidungById(id: number, userId: number) {
    try {
      const itinerary = await this.prisma.lichtrinh_nguoidung.findFirst({
        where: { lichtrinh_nguoidung_id: id, nguoidung_id: userId },
        include: {
          lichtrinh_nguoidung_diadiem: {
            include: { diadiem: true },
            orderBy: { thutu: 'asc' },
          },
          lichtrinh_nguoidung_ngay: {
            orderBy: { ngay_thu_may: 'asc' },
          },
          nguoidung: {
            select: {
              nguoidung_id: true,
              ten: true,
            },
          },
          tuyen_duong: {
            orderBy: { ngay_thu_may: 'asc' },
          },
        },
      });

      if (!itinerary) {
        throw new HttpException(
          'Lịch trình cá nhân không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      return itinerary;
    } catch (error) {
      this.logger.error('Lỗi lấy chi tiết lịch trình cá nhân:', error);
      throw new HttpException(
        'Lỗi lấy chi tiết lịch trình cá nhân: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật lịch trình cá nhân
   */
  async updateLichtrinhNguoidung(
    id: number,
    dto: UpdateLichtrinhNguoidungDto,
    userId: number,
  ) {
    try {
      const existing = await this.prisma.lichtrinh_nguoidung.findFirst({
        where: { lichtrinh_nguoidung_id: id, nguoidung_id: userId },
      });

      if (!existing) {
        throw new HttpException(
          'Lịch trình cá nhân không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const parsedStartDate = dto.ngaybatdau
          ? new Date(dto.ngaybatdau)
          : existing.ngaybatdau;
        const parsedEndDate = dto.ngayketthuc
          ? new Date(dto.ngayketthuc)
          : existing.ngayketthuc;

        const updated = await tx.lichtrinh_nguoidung.update({
          where: { lichtrinh_nguoidung_id: id },
          data: {
            tieude: dto.tieude || existing.tieude,
            ngaybatdau: parsedStartDate,
            ngayketthuc: parsedEndDate,
            trangthai: dto.trangthai || existing.trangthai,
          },
        });

        // Nếu có places mới, xóa cái cũ và thêm mới
        if (dto.places && Array.isArray(dto.places)) {
          await tx.lichtrinh_nguoidung_diadiem.deleteMany({
            where: { lichtrinh_nguoidung_id: id },
          });

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

          for (let index = 0; index < upsertedPlaces.length; index++) {
            const place = dto.places[index];
            const upsertedPlace = upsertedPlaces[index];

            await tx.lichtrinh_nguoidung_diadiem.create({
              data: {
                lichtrinh_nguoidung_id: id,
                diadiem_id: upsertedPlace.diadiem_id,
                thutu: index + 1,
                ngay_thu_may: place.ngay_thu_may || 1,
                thoigian_den: place.thoigian_den
                  ? (() => { const [h, m] = place.thoigian_den.split(':'); const d = new Date(0); d.setUTCHours(+h, +m, 0, 0); return d; })()
                  : null,
                thoiluong: place.thoiluong || null,
                ghichu: place.ghichu || null,
              },
            });
          }

          // Xóa cũ + tạo mới day configs
          await tx.lichtrinh_nguoidung_ngay.deleteMany({
            where: { lichtrinh_nguoidung_id: id },
          });

          if (dto.dayConfigs && Array.isArray(dto.dayConfigs)) {
            for (const dc of dto.dayConfigs) {
              await tx.lichtrinh_nguoidung_ngay.create({
                data: {
                  lichtrinh_nguoidung_id: id,
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
        }

        return updated;
      });

      return result;
    } catch (error) {
      this.logger.error('Lỗi cập nhật lịch trình cá nhân:', error);
      throw new HttpException(
        'Lỗi cập nhật lịch trình cá nhân: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa lịch trình cá nhân
   */
  async deleteLichtrinhNguoidung(id: number, userId: number) {
    try {
      const existing = await this.prisma.lichtrinh_nguoidung.findFirst({
        where: { lichtrinh_nguoidung_id: id, nguoidung_id: userId },
      });

      if (!existing) {
        throw new HttpException(
          'Lịch trình cá nhân không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.lichtrinh_nguoidung.delete({
        where: { lichtrinh_nguoidung_id: id },
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Lỗi xóa lịch trình cá nhân:', error);
      throw new HttpException(
        'Lỗi xóa lịch trình cá nhân: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [Admin] Lấy danh sách lịch trình của bất kỳ user nào (bỏ qua kiểm tra ownership)
   */
  async getLichtrinhByUserAdmin(nguoidung_id: number) {
    try {
      const itineraries = await this.prisma.lichtrinh_nguoidung.findMany({
        where: { nguoidung_id },
        include: {
          lichtrinh_nguoidung_diadiem: {
            include: { diadiem: true },
            orderBy: { thutu: 'asc' },
          },
          nguoidung: {
            select: { nguoidung_id: true, ten: true, email: true },
          },
        },
        orderBy: { ngaytao: 'desc' },
      });
      return { itineraries, total: itineraries.length };
    } catch (error) {
      this.logger.error('Lỗi lấy lịch trình (admin):', error);
      throw new HttpException(
        'Lỗi lấy lịch trình: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * [Admin] Lấy chi tiết lịch trình theo ID (bỏ qua kiểm tra ownership)
   */
  async getLichtrinhByIdAdmin(id: number) {
    try {
      const itinerary = await this.prisma.lichtrinh_nguoidung.findUnique({
        where: { lichtrinh_nguoidung_id: id },
        include: {
          lichtrinh_nguoidung_diadiem: {
            include: { diadiem: true },
            orderBy: { thutu: 'asc' },
          },
          nguoidung: {
            select: { nguoidung_id: true, ten: true, email: true },
          },
          tuyen_duong: { orderBy: { ngay_thu_may: 'asc' } },
        },
      });
      if (!itinerary) {
        throw new HttpException('Lịch trình không tồn tại', HttpStatus.NOT_FOUND);
      }
      return itinerary;
    } catch (error) {
      this.logger.error('Lỗi lấy chi tiết lịch trình (admin):', error);
      throw new HttpException(
        'Lỗi lấy chi tiết: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
