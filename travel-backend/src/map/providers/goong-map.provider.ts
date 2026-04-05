import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoongMapProvider {
  private readonly logger = new Logger(GoongMapProvider.name);
  private readonly goongApiKey: string;
  private readonly baseUrl = 'https://rsapi.goong.io';

  constructor() {
    const apiKey = process.env.GOONG_API_KEY;
    if (!apiKey) {
      throw new Error('❌ GOONG_API_KEY not configured');
    }
    this.goongApiKey = apiKey;
  }

  async fetchAutocomplete(keyword: string, lat?: number, lng?: number) {
    try {
      const params: any = {
        input: keyword,
        api_key: this.goongApiKey,
      };

      if (lat && lng) {
        params.location = `${lat},${lng}`;
      }

      const response = await axios.get(`${this.baseUrl}/Place/AutoComplete`, { params });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Goong Autocomplete API error: ${error.message}`);
      throw new HttpException('Failed to get autocomplete predictions from Goong', HttpStatus.BAD_GATEWAY);
    }
  }

  async fetchGeocode(address: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/Geocode`, {
        params: { address, api_key: this.goongApiKey },
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Goong Geocode API error: ${error.message}`);
      throw new HttpException('Geocoding failed from Goong', HttpStatus.BAD_GATEWAY);
    }
  }

  async fetchPlaceDetail(placeId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/Place/Detail`, {
        params: { place_id: placeId, api_key: this.goongApiKey },
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Goong Place Detail API error: ${error.message}`);
      throw new HttpException('Failed to get place detail from Goong', HttpStatus.BAD_GATEWAY);
    }
  }

  async fetchDistanceMatrix(origins: string, destinations: string, vehicle: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/DistanceMatrix`, {
        params: {
          origins,
          destinations,
          vehicle,
          api_key: this.goongApiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Goong Distance Matrix API error: ${error.message}`);
      throw new HttpException('Failed to calculate distance from Goong', HttpStatus.BAD_GATEWAY);
    }
  }

  async fetchDirection(origin: string, destination: string, alternatives: boolean, vehicle: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/Direction`, {
        params: {
          origin,
          destination,
          alternatives: alternatives ? 'true' : 'false',
          vehicle,
          api_key: this.goongApiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Goong Direction API error: ${error.message}`);
      throw new HttpException('Failed to get direction from Goong', HttpStatus.BAD_GATEWAY);
    }
  }
}
