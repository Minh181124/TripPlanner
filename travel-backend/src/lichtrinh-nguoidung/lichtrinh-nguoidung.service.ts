import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLichtrinhNguoidungDto, UpdateLichtrinhNguoidungDto, LichtrinhNguoidungPlaceItemDto } from './dto/create-lichtrinh-nguoidung.dto';

/**
 * Safely parse a "HH:mm" time string into a UTC Date, or return null if invalid.
 * Prevents Prisma "Invalid Date" errors when the input is empty/malformed.
 */
function safeParseTime(timeStr: string | null | undefined): Date | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  const d = new Date(0);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

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
              thoigian_den: safeParseTime(place.thoigian_den),
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
              include: { 
                diadiem: {
                  select: { ten: true }
                },
                ve_diadiem_lichtrinh: true
              },
              orderBy: { thutu: 'asc' },
            },
            lichtrinh_nguoidung_ngay: {
              orderBy: { ngay_thu_may: 'asc' },
            },
          },
          orderBy: { ngaytao: 'desc' },
        }),
        this.prisma.lichtrinh_nguoidung.count({
          where: { nguoidung_id },
        }),
      ]);

      const formattedItineraries = itineraries.map((it: any) => {
        const totalTickets = it.lichtrinh_nguoidung_diadiem?.reduce((sum: number, place: any) => {
          return sum + (place.ve_diadiem_lichtrinh?.length || 0);
        }, 0) || 0;
        return {
          ...it,
          ticketsCount: totalTickets
        };
      });

      return {
        itineraries: formattedItineraries,
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
          const currentPlaceIds = dto.places
            .map((p: any) => p.id)
            .filter((id) => !!id);

          // 1. Xóa các địa điểm không còn trong danh sách gửi lên
          await tx.lichtrinh_nguoidung_diadiem.deleteMany({
            where: {
              lichtrinh_nguoidung_id: id,
              id: { notIn: currentPlaceIds as number[] },
            },
          });

          // 2. Xử lý từng địa điểm: Update nếu có ID, Create nếu chưa có
          for (let index = 0; index < dto.places.length; index++) {
            const place = dto.places[index];
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
            const placeData = {
              lichtrinh_nguoidung_id: id,
              diadiem_id: upsertedPlace.diadiem_id,
              thutu: index + 1,
              ngay_thu_may: place.ngay_thu_may || 1,
              thoigian_den: safeParseTime(place.thoigian_den),
              thoiluong: place.thoiluong || null,
              ghichu: place.ghichu || null,
            };

            if ((place as any).id) {
              // Cập nhật địa điểm cũ -> Giữ lại link Vé
              await tx.lichtrinh_nguoidung_diadiem.update({
                where: { id: (place as any).id },
                data: placeData,
              });
            } else {
              // Tạo địa điểm mới
              await tx.lichtrinh_nguoidung_diadiem.create({
                data: placeData,
              });
            }
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

  /**
   * Tạo lịch trình cá nhân từ lịch trình mẫu (Deep copy)
   * 
   * Quy trình:
   * 1. Lấy lịch trình mẫu với tất cả dữ liệu liên quan
   * 2. Copy các địa điểm (nếu chưa tồn tại)
   * 3. Tạo nhanh lịch trình người dùng
   * 4. Copy các địa điểm liên kết (lichtrinh_nguoidung_diadiem)
   * 5. Copy các cấu hình ngày (lichtrinh_nguoidung_ngay)
   * 6. Copy các tuyến đường (tuyen_duong)
   */
  async createLichtrinhNguoidungFromSample(sampleId: number, nguoidung_id: number) {
    if (!sampleId || !nguoidung_id) {
      throw new HttpException('Sampleid và nguoidung_id là bắt buộc', HttpStatus.BAD_REQUEST);
    }

    try {
      // STEP 1: Kiểm tra sample tồn tại và chỉ chấp nhận APPROVED
      const sample = await this.prisma.lichtrinh_mau.findUnique({
        where: { lichtrinh_mau_id: sampleId },
        include: {
          lichtrinh_mau_diadiem: {
            include: { diadiem: true },
            orderBy: { thutu: 'asc' },
          },
          lichtrinh_mau_ngay: {
            orderBy: { ngay_thu_may: 'asc' },
          },
          tuyen_duong: {
            orderBy: { thutu: 'asc' },
          },
        },
      });

      if (!sample) {
        throw new HttpException('Lịch trình mẫu không tồn tại', HttpStatus.NOT_FOUND);
      }

      if (sample.trang_thai !== 'APPROVED') {
        throw new HttpException(
          'Chỉ có thể sao chép lịch trình mẫu đã được duyệt',
          HttpStatus.FORBIDDEN,
        );
      }

      // STEP 2: Kiểm tra user tồn tại
      const user = await this.prisma.nguoidung.findUnique({
        where: { nguoidung_id },
      });

      if (!user) {
        throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
      }

      // STEP 3: Thực hiện transaction để copy toàn bộ dữ liệu
      const result = await this.prisma.$transaction(async (tx) => {
        // 3a. Copy các địa điểm (upsert)
        const placeMapping = new Map<number, number>(); // samplePlaceId -> newPlaceId

        for (const samplePlace of sample.lichtrinh_mau_diadiem) {
          if (!samplePlace.diadiem) continue;

          const upsertedPlace = await tx.diadiem.upsert({
            where: { google_place_id: samplePlace.diadiem.google_place_id },
            update: {
              ten: samplePlace.diadiem.ten,
              diachi: samplePlace.diadiem.diachi || null,
              lat: samplePlace.diadiem.lat,
              lng: samplePlace.diadiem.lng,
              ngaycapnhat: new Date(),
            },
            create: {
              google_place_id: samplePlace.diadiem.google_place_id,
              ten: samplePlace.diadiem.ten,
              diachi: samplePlace.diadiem.diachi || null,
              lat: samplePlace.diadiem.lat,
              lng: samplePlace.diadiem.lng,
              ngaycapnhat: new Date(),
            },
          });
          placeMapping.set(samplePlace.diadiem.diadiem_id, upsertedPlace.diadiem_id);
        }

        // 3b. Tạo lịch trình người dùng mới (không có ngày)
        const newItinerary = await tx.lichtrinh_nguoidung.create({
          data: {
            nguoidung_id: user.nguoidung_id,
            tieude: sample.tieude,
            trangthai: 'planning',
            ngaytao: new Date(),
            ngaybatdau: null,
            ngayketthuc: null,
            lichtrinh_mau_id: sampleId, // Track origin
          },
        });

        // 3c. Copy lichtrinh_mau_diadiem → lichtrinh_nguoidung_diadiem
        for (const sampleDetail of sample.lichtrinh_mau_diadiem) {
          if (!sampleDetail.diadiem_id) continue;
          const mappedDiadiemId = placeMapping.get(sampleDetail.diadiem_id);
          if (!mappedDiadiemId) continue;

          await tx.lichtrinh_nguoidung_diadiem.create({
            data: {
              lichtrinh_nguoidung_id: newItinerary.lichtrinh_nguoidung_id,
              diadiem_id: mappedDiadiemId,
              thutu: sampleDetail.thutu,
              ngay_thu_may: sampleDetail.ngay_thu_may || 1,
              thoigian_den: sampleDetail.thoigian_den || null,
              thoiluong: sampleDetail.thoiluong || null,
              ghichu: sampleDetail.ghichu || null,
            },
          });
        }

        // 3d. Copy lichtrinh_mau_ngay → lichtrinh_nguoidung_ngay
        for (const sampleDay of sample.lichtrinh_mau_ngay) {
          await tx.lichtrinh_nguoidung_ngay.create({
            data: {
              lichtrinh_nguoidung_id: newItinerary.lichtrinh_nguoidung_id,
              ngay_thu_may: sampleDay.ngay_thu_may,
              gio_batdau: sampleDay.gio_batdau || null,
              diem_batdau_ten: sampleDay.diem_batdau_ten || null,
              diem_batdau_lat: sampleDay.diem_batdau_lat || null,
              diem_batdau_lng: sampleDay.diem_batdau_lng || null,
              diem_ketthuc_ten: sampleDay.diem_ketthuc_ten || null,
              diem_ketthuc_lat: sampleDay.diem_ketthuc_lat || null,
              diem_ketthuc_lng: sampleDay.diem_ketthuc_lng || null,
            },
          });
        }

        // 3e. Copy tuyen_duong (routes)
        for (const sampleRoute of sample.tuyen_duong) {
          const mappedStartId = sampleRoute.diadiem_batdau_id
            ? placeMapping.get(sampleRoute.diadiem_batdau_id)
            : null;
          const mappedEndId = sampleRoute.diadiem_ketthuc_id
            ? placeMapping.get(sampleRoute.diadiem_ketthuc_id)
            : null;

          await tx.tuyen_duong.create({
            data: {
              lichtrinh_nguoidung_id: newItinerary.lichtrinh_nguoidung_id,
              diadiem_batdau_id: mappedStartId || null,
              diadiem_ketthuc_id: mappedEndId || null,
              polyline: sampleRoute.polyline || null,
              phuongtien: sampleRoute.phuongtien || 'car',
              tong_khoangcach: sampleRoute.tong_khoangcach || null,
              tong_thoigian: sampleRoute.tong_thoigian || null,
              ngay_thu_may: sampleRoute.ngay_thu_may || 1,
              thutu: sampleRoute.thutu || null,
              ngaytao: new Date(),
            },
          });
        }

        return newItinerary;
      });

      this.logger.log(
        `Tạo lịch trình cá nhân từ mẫu thành công: ${result.lichtrinh_nguoidung_id} (từ mẫu ${sampleId})`,
      );

      return {
        message: 'Tạo lịch trình từ mẫu thành công',
        data: {
          lichtrinh_nguoidung_id: result.lichtrinh_nguoidung_id,
          tieude: result.tieude,
          nguoidung_id: result.nguoidung_id,
          from_sample_id: sampleId,
        },
      };
    } catch (error) {
      this.logger.error('Lỗi tạo lịch trình từ mẫu:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Lỗi tạo lịch trình từ mẫu: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

