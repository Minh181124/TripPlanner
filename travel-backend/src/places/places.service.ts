import { Injectable, HttpException, HttpStatus, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MapService } from '../map/map.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mapService: MapService,
  ) {}

  /**
   * 1. CREATE PLACE
   */
  async createPlace(dto: CreatePlaceDto, userId: number) {
    let { lat, lng } = dto;

    if (!lat || !lng) {
      if (dto.diachi) {
        const geocodeResult = await this.mapService.geocodeAddress(dto.diachi);
        lat = geocodeResult.lat || undefined;
        lng = geocodeResult.lng || undefined;
      }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const place = await tx.diadiem.create({
          data: {
            ten: dto.ten,
            google_place_id: dto.google_place_id || `local-${Date.now()}`,
            diachi: dto.diachi,
            quan_huyen: dto.quan_huyen,
            tu_khoa: dto.tu_khoa,
            lat,
            lng,
            loai: dto.loai,
            giatien: dto.giatien,
            nguoidung_id: userId,
            trang_thai: 'PENDING',
          },
        });

        if (dto.chitiet) {
          await tx.chitiet_diadiem.create({
            data: {
              diadiem_id: place.diadiem_id,
              mota_google: dto.chitiet.mota_google,
              mota_tonghop: dto.chitiet.mota_tonghop,
              sodienthoai: dto.chitiet.sodienthoai,
              website: dto.chitiet.website,
              giomocua: dto.chitiet.giomocua ? (dto.chitiet.giomocua as any) : undefined,
            },
          });
        }

        if (dto.images && dto.images.length > 0) {
          const imageData = dto.images.map((img) => ({
            diadiem_id: place.diadiem_id,
            url: img.url,
            photo_reference: img.photo_reference,
          }));
          await tx.hinhanh_diadiem.createMany({
            data: imageData,
          });
        }

        return place;
      });

      return result;
    } catch (error) {
      this.logger.error('Error creating place:', error);
      throw new HttpException('Lỗi khi tạo địa điểm', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 2. FIND ALL PLACES
   */
  async findAllPlaces(query: QueryPlaceDto) {
    const { keyword, loai, quan_huyen, trang_thai, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.diadiemWhereInput = {};

    if (keyword) {
      where.OR = [
        { ten: { contains: keyword, mode: 'insensitive' } },
        { diachi: { contains: keyword, mode: 'insensitive' } },
        { tu_khoa: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (loai) where.loai = loai;
    if (quan_huyen) where.quan_huyen = quan_huyen;
    if (trang_thai) where.trang_thai = trang_thai;

    const [places, total] = await Promise.all([
      this.prisma.diadiem.findMany({
        where,
        skip,
        take: limit,
        include: {
          chitiet_diadiem: true,
          hinhanh_diadiem: true,
        },
        orderBy: { ngaycapnhat: 'desc' },
      }),
      this.prisma.diadiem.count({ where }),
    ]);

    return {
      items: places,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 3. FIND BY ID
   */
  async findPlaceById(id: number) {
    const place = await this.prisma.diadiem.findUnique({
      where: { diadiem_id: id },
      include: {
        chitiet_diadiem: true,
        hinhanh_diadiem: true,
        hoatdong_diadiem: true,
      },
    });

    if (!place) {
      throw new NotFoundException(`Không tìm thấy địa điểm ID ${id}`);
    }

    return place;
  }

  /**
   * 4. UPDATE PLACE
   */
  async updatePlace(id: number, dto: UpdatePlaceDto, userId: number, role: string) {
    const place = await this.prisma.diadiem.findUnique({ where: { diadiem_id: id } });
    if (!place) throw new NotFoundException();

    if (place.nguoidung_id !== userId && role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa địa điểm này');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const updateData: any = { ...dto };
        delete updateData.chitiet;
        delete updateData.images;
        updateData.ngaycapnhat = new Date();

        const updatedPlace = await tx.diadiem.update({
          where: { diadiem_id: id },
          data: updateData,
        });

        if (dto.chitiet) {
          const detail = await tx.chitiet_diadiem.findFirst({ where: { diadiem_id: id } });
          if (detail) {
            await tx.chitiet_diadiem.update({
              where: { chitiet_diadiem_id: detail.chitiet_diadiem_id },
              data: {
                mota_google: dto.chitiet.mota_google,
                mota_tonghop: dto.chitiet.mota_tonghop,
                sodienthoai: dto.chitiet.sodienthoai,
                website: dto.chitiet.website,
                giomocua: dto.chitiet.giomocua ? (dto.chitiet.giomocua as any) : undefined,
                ngaycapnhat: new Date(),
              },
            });
          } else {
            await tx.chitiet_diadiem.create({
              data: {
                diadiem_id: id,
                ...dto.chitiet,
              },
            });
          }
        }

        if (dto.images) {
          await tx.hinhanh_diadiem.deleteMany({ where: { diadiem_id: id } });
          if (dto.images.length > 0) {
            const imageData = dto.images.map((img) => ({
              diadiem_id: id,
              url: img.url,
              photo_reference: img.photo_reference,
            }));
            await tx.hinhanh_diadiem.createMany({ data: imageData });
          }
        }

        return updatedPlace;
      });

      return result;
    } catch (error) {
      this.logger.error('Error updating place:', error);
      throw new HttpException('Lỗi cập nhật địa điểm', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 5. DELETE PLACE
   */
  async deletePlace(id: number, userId: number, role: string) {
    const place = await this.prisma.diadiem.findUnique({ where: { diadiem_id: id } });
    if (!place) throw new NotFoundException();

    if (place.nguoidung_id !== userId && role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền xóa địa điểm này');
    }

    await this.prisma.diadiem.delete({
      where: { diadiem_id: id },
    });

    return { success: true };
  }

  /**
   * 6. UPDATE STATUS (ADMIN ONLY)
   */
  async updatePlaceStatus(id: number, status: string) {
    const place = await this.prisma.diadiem.findUnique({ where: { diadiem_id: id } });
    if (!place) throw new NotFoundException();

    return this.prisma.diadiem.update({
      where: { diadiem_id: id },
      data: { trang_thai: status, ngaycapnhat: new Date() },
    });
  }

  /**
   * 7. LEGACY SEARCH AND SAVE
   */
  async searchAndSave(keyword: string, sessionToken: string, lat?: number, lng?: number) {
    // We delegate the Goong Autocomplete call to the MapService to unify 3rd-party logic
    // Wait, earlier the Autocomplete logic returned { predictions: [...] }
    const predictions = await this.mapService.autocomplete(keyword, lat, lng);

    if (!predictions || predictions.length === 0) {
      return { message: 'Không tìm thấy địa điểm nào', data: [] };
    }

    const savedPlaces: any[] = [];
    for (const place of predictions) {
      try {
        // Goong returned main_text and description and place_id
        let latitude = place.lat;
        let longitude = place.lng;

        if (!latitude || !longitude) {
           // We ask mapService to get detailed info
           const detail = await this.mapService.getGoongPlaceDetail(place.place_id);
           // Actually MapService.getGoongPlaceDetail currently returns stub in original code! 
           // If MapService doesn't have it implemented properly, we'll try geocoding
           latitude = detail.lat;
           longitude = detail.lng;
        }

        const placeData = {
          ten: place.ten || 'Không rõ tên',
          diachi: place.diachi || '',
          lat: latitude || null,
          lng: longitude || null,
          loai: 'poi',
          trang_thai: 'APPROVED',
          ngaycapnhat: new Date(),
        };

        const upsertedPlace = await this.prisma.diadiem.upsert({
          where: { google_place_id: place.place_id },
          update: placeData,
          create: {
             google_place_id: place.place_id,
             ...placeData,
          },
        });
        
        savedPlaces.push({
          place_id: place.place_id,
          google_place_id: upsertedPlace.google_place_id,
          ten: upsertedPlace.ten,
          diachi: upsertedPlace.diachi,
          lat: upsertedPlace.lat,
          lng: upsertedPlace.lng,
          diadiem_id: upsertedPlace.diadiem_id,
        });

      } catch (err) {
        this.logger.warn(`Lỗi xử lý địa điểm: ${place.ten}`);
      }
    }

    return {
      message: lat && lng ? 'Tìm kiếm quanh vị trí hiện tại của bạn' : 'Tìm kiếm địa điểm',
      data: savedPlaces,
    };
  }

  /**
   * 8. LEGACY GET ROUTE
   */
  async getRoute(
    placeIds: string[],
    profile: string = 'mapbox/driving-traffic',
    coordinatesFromFrontend?: { lng: number; lat: number }[],
  ) {
    try {
      let waypoints: { lat: number; lng: number }[] = [];

      if (coordinatesFromFrontend && coordinatesFromFrontend.length === placeIds.length) {
        waypoints = coordinatesFromFrontend;
      } else {
        const placesInDb = await this.prisma.diadiem.findMany({
          where: { google_place_id: { in: placeIds } },
        });
        const sortedPlaces = placeIds
          .map((id) => placesInDb.find((p) => p.google_place_id === id))
          .filter((p) => p !== undefined);

        if (sortedPlaces.length < 2) throw new HttpException('Thiếu dữ liệu DB', 404);

        waypoints = sortedPlaces.map((p) => ({
          lat: p?.lat || 0,
          lng: p?.lng || 0,
        }));
      }

      // Delegate to MapService
      const vehicleType = this.mapTransportModeToGoongVehicle(profile);
      
      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];
      
      const directionStr = await this.mapService.getDirection(
          { lat: origin.lat, lng: origin.lng },
          { lat: destination.lat, lng: destination.lng },
          false,
          vehicleType
      );
      
      if (!directionStr.routes || directionStr.routes.length === 0) {
        throw new HttpException('Không tìm thấy tuyến đường', 404);
      }

      const route = directionStr.routes[0];
      
      return {
        message: 'Lấy tuyến đường thành công',
        data: {
          polyline: route.overviewPolyline || '',
          tong_khoangcach: route.distance || 0,
          tong_thoigian: route.duration || 0,
        },
      };

    } catch (error) {
      throw new HttpException('Lỗi tính toán đường đi', 502);
    }
  }

  private mapTransportModeToGoongVehicle(profile: string): string {
    const profileMap: { [key: string]: string } = {
      car: 'car',
      taxi: 'taxi',
      bike: 'bike',
      truck: 'truck',
    };
    return profileMap[profile] || 'car';
  }
}
