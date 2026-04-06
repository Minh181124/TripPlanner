import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoongMapProvider } from './providers/goong-map.provider';
import { Coordinate } from './interfaces/map.interface';

@Injectable()
export class MapService {
  private readonly logger = new Logger(MapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly goongMapProvider: GoongMapProvider,
  ) {}

  async hybridSearch(keyword: string, lat?: number, lng?: number, loai?: string) {
    try {
      const whereClause: any = {};
      
      if (keyword && keyword.trim() !== '') {
        whereClause.OR = [
          { ten: { contains: keyword, mode: 'insensitive' } },
          { tu_khoa: { contains: keyword, mode: 'insensitive' } },
          { quan_huyen: { contains: keyword, mode: 'insensitive' } },
        ];
      }

      if (loai && loai !== 'all') {
        whereClause.loai = loai;
      }

      const internalPlaces = await this.prisma.diadiem.findMany({
        where: whereClause,
        include: {
          chitiet_diadiem: true,
          hoatdong_diadiem: true,
          hinhanh_diadiem: true,
        },
        take: 30, // Tăng limit lên một chút để hiển thị đa dạng
      });

      return internalPlaces.map((place) => ({
        diadiem_id: place.diadiem_id,
        place_id: place.google_place_id,
        google_place_id: place.google_place_id,
        ten: place.ten,
        diachi: place.diachi,
        quan_huyen: place.quan_huyen,
        lat: place.lat,
        lng: place.lng,
        loai: place.loai,
        is_internal: true,
        chitiet_diadiem: place.chitiet_diadiem,
        hoatdong_diadiem: place.hoatdong_diadiem,
        hinhanh_diadiem: place.hinhanh_diadiem,
      }));
    } catch (error: any) {
      this.logger.error(`Internal search error: ${error.message}`);
      throw new HttpException('Search failed', HttpStatus.BAD_GATEWAY);
    }
  }

  async autocomplete(keyword: string, lat?: number, lng?: number) {
    if (!keyword || keyword.length < 2) {
      return [];
    }

    const data: any = await this.goongMapProvider.fetchAutocomplete(keyword, lat, lng);

    if (!data.predictions) {
      return [];
    }

    return data.predictions.map((prediction: any) => ({
      place_id: prediction.place_id,
      description: prediction.description,
      main_text: prediction.structured_formatting?.main_text || prediction.description,
      secondary_text: prediction.structured_formatting?.secondary_text || '',
      district: prediction.compound?.district || '',
      lat: null,
      lng: null,
      ten: prediction.structured_formatting?.main_text || prediction.description,
      diachi: prediction.description,
    }));
  }

  async getGoongPlaceDetail(placeId: string) {
    if (!placeId) return null;
    return this.goongMapProvider.fetchPlaceDetail(placeId);
  }

  async geocodeAddress(address: string) {
    if (!address || address.trim().length < 2) {
      throw new HttpException('Address too short', HttpStatus.BAD_REQUEST);
    }

    const data: any = await this.goongMapProvider.fetchGeocode(address.trim());

    if (!data.results || data.results.length === 0) {
      this.logger.warn(`Geocode: No results for address "${address}"`);
      return {
        lat: null,
        lng: null,
        formatted_address: address,
      };
    }

    const result = data.results[0];
    const location = result.geometry?.location;

    if (!location) {
      return {
        lat: null,
        lng: null,
        formatted_address: address,
      };
    }

    return {
      lat: location.lat,
      lng: location.lng,
      formatted_address: result.formatted_address || address,
    };
  }

  async getPlaceDetail(placeId: string) {
    const diaDiemId = parseInt(placeId, 10);
    
    let place;
    if (!isNaN(diaDiemId)) {
      place = await this.prisma.diadiem.findUnique({
        where: { diadiem_id: diaDiemId },
        include: {
          chitiet_diadiem: true,
          hoatdong_diadiem: true,
          hinhanh_diadiem: true,
        },
      });
    } else {
      place = await this.prisma.diadiem.findUnique({
        where: { google_place_id: placeId },
        include: {
          chitiet_diadiem: true,
          hoatdong_diadiem: true,
          hinhanh_diadiem: true,
        },
      });
    }

    if (!place) {
      throw new HttpException('Place not found in database', HttpStatus.NOT_FOUND);
    }

    return {
      diadiem_id: place.diadiem_id,
      place_id: place.google_place_id,
      google_place_id: place.google_place_id,
      ten: place.ten,
      diachi: place.diachi,
      quan_huyen: place.quan_huyen,
      lat: place.lat,
      lng: place.lng,
      loai: place.loai,
      danhgia: place.danhgia,
      soluotdanhgia: place.soluotdanhgia,
      giatien: place.giatien,
      tu_khoa: place.tu_khoa,
      chitiet_diadiem: place.chitiet_diadiem,
      hoatdong_diadiem: place.hoatdong_diadiem,
      hinhanh_diadiem: place.hinhanh_diadiem,
    };
  }

  async getDistanceMatrix(
    origins: Coordinate[],
    destinations: Coordinate[],
    vehicleType: string = 'car',
  ) {
    if (origins.length === 0 || destinations.length === 0) {
      throw new HttpException('Invalid coordinates', HttpStatus.BAD_REQUEST);
    }

    const originStr = origins.map((o) => `${o.lat},${o.lng}`).join(';');
    const destStr = destinations.map((d) => `${d.lat},${d.lng}`).join(';');

    const data: any = await this.goongMapProvider.fetchDistanceMatrix(originStr, destStr, vehicleType);

    if (!data.rows || data.rows.length === 0) {
      throw new HttpException('No route found', HttpStatus.NOT_FOUND);
    }

    return data.rows.map((row: any, idx: number) => {
      if (row.elements && row.elements.length > 0) {
        const element = row.elements[0];
        return {
          origin_index: idx,
          distance: element.distance || 0,
          duration: element.duration || 0,
          distance_text: element.distance_text,
          duration_text: element.duration_text,
        };
      }
      return null;
    }).filter((d: any) => d !== null);
  }

  async getDirection(
    origin: Coordinate | string,
    destination: Coordinate | string,
    alternatives: boolean = true,
    vehicleType: string = 'car',
  ) {
    // Robust parsing in case DTO transformation fails at controller layer
    let parsedOrigin: Coordinate;
    let parsedDest: Coordinate;

    try {
      if (typeof origin === 'string') {
        const [lat, lng] = origin.split(',').map(Number);
        parsedOrigin = { lat, lng };
      } else {
        parsedOrigin = origin as Coordinate;
      }

      if (typeof destination === 'string') {
        const [lat, lng] = destination.split(',').map(Number);
        parsedDest = { lat, lng };
      } else {
        parsedDest = destination as Coordinate;
      }
    } catch (e) {
      throw new HttpException('Invalid origin or destination coordinates', HttpStatus.BAD_REQUEST);
    }

    if (!parsedOrigin?.lat || !parsedOrigin?.lng || !parsedDest?.lat || !parsedDest?.lng) {
      throw new HttpException('Invalid origin or destination coordinates', HttpStatus.BAD_REQUEST);
    }

    try {
      const data: any = await this.goongMapProvider.fetchDirection(
        `${parsedOrigin.lat},${parsedOrigin.lng}`,
        `${parsedDest.lat},${parsedDest.lng}`,
        alternatives,
        vehicleType,
      );

      if (!data?.routes || data.routes.length === 0) {
        throw new HttpException('No route found', HttpStatus.NOT_FOUND);
      }

      const routes = data.routes.map((route: any) => ({
        distance: route.legs?.[0]?.distance?.value || 0,
        duration: route.legs?.[0]?.duration?.value || 0,
        distanceText: route.legs?.[0]?.distance?.text || '',
        durationText: route.legs?.[0]?.duration?.text || '',
        overviewPolyline: route.overview_polyline?.points || '',
      }));

      return {
        routes,
        summary: {
          originName: data.routes[0]?.legs[0]?.start_address || 'Origin',
          destinationName: data.routes[0]?.legs[0]?.end_address || 'Destination',
        },
      };
    } catch (error: any) {
      if (error.status === 400 || error.status === 404 || error.response?.status === 400 || error.response?.status === 404) {
        const distance = Math.sqrt(
          Math.pow(parsedDest.lat - parsedOrigin.lat, 2) + Math.pow(parsedDest.lng - parsedOrigin.lng, 2),
        ) * 111000;
        const estimatedDuration = Math.ceil(distance / 13);

        return {
          routes: [
            {
              distance: Math.round(distance),
              duration: Math.round(estimatedDuration),
              distanceText: `${(distance / 1000).toFixed(1)} km`,
              durationText: `${Math.ceil(estimatedDuration / 60)} min`,
              overviewPolyline: '',
            },
          ],
          summary: { originName: 'Origin', destinationName: 'Destination' },
        };
      }
      throw error;
    }
  }
}
