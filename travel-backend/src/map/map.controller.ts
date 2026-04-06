import { Controller, Get, Query } from '@nestjs/common';
import { MapService } from './map.service';
import { SearchDto } from './dto/search.dto';
import { AutocompleteDto } from './dto/autocomplete.dto';
import { PlaceDetailDto } from './dto/place-detail.dto';
import { GeocodeDto } from './dto/geocode.dto';
import { DistanceMatrixDto } from './dto/distance-matrix.dto';
import { DirectionDto } from './dto/direction.dto';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('search')
  async search(@Query() searchDto: SearchDto) {
    return this.mapService.hybridSearch(
      searchDto.keyword,
      searchDto.lat,
      searchDto.lng,
      searchDto.loai,
    );
  }

  @Get('autocomplete')
  async autocomplete(@Query() autocompleteDto: AutocompleteDto) {
    return this.mapService.autocomplete(
      autocompleteDto.input,
      autocompleteDto.lat,
      autocompleteDto.lng,
    );
  }

  @Get('autocomplete-detail')
  async getAutocompletePlaceDetail(@Query() dto: PlaceDetailDto) {
    return this.mapService.getGoongPlaceDetail(dto.place_id);
  }

  @Get('place-detail')
  async getPlaceDetail(@Query() dto: PlaceDetailDto) {
    return this.mapService.getPlaceDetail(dto.place_id);
  }

  @Get('geocode')
  async geocode(@Query() dto: GeocodeDto) {
    return this.mapService.geocodeAddress(dto.address);
  }

  @Get('distance-matrix')
  async distanceMatrix(@Query() dto: DistanceMatrixDto) {
    return this.mapService.getDistanceMatrix(
      dto.origins,
      dto.destinations,
      dto.vehicle,
    );
  }

  @Get('direction')
  async getDirection(@Query() dto: DirectionDto) {
    return this.mapService.getDirection(
      dto.origin,
      dto.destination,
      dto.alternatives,
      dto.vehicle,
    );
  }
}
