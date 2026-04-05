import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Patch,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { SearchPlaceDto, GetRouteDto } from './dto/places.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';
import { PlaceResponseEntity } from './entities/place-response.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  /**
   * CREATE PLACE
   */
  @ApiOperation({ summary: 'Tạo địa điểm mới' })
  @ApiResponse({ status: 201, description: 'Created', type: PlaceResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(201)
  async createPlace(@Body() dto: CreatePlaceDto, @CurrentUser() user: any) {
    const rawPlace = await this.placesService.createPlace(dto, user.nguoidung_id);
    return new PlaceResponseEntity(rawPlace as any);
  }

  /**
   * FIND ALL PLACES
   */
  @ApiOperation({ summary: 'Lấy danh sách địa điểm (có phân trang và lọc)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(@Query() query: QueryPlaceDto) {
    const { items, meta } = await this.placesService.findAllPlaces(query);
    return {
      items: items.map((p) => new PlaceResponseEntity(p as any)),
      meta,
    };
  }

  /**
   * FIND ONE PLACE
   */
  @ApiOperation({ summary: 'Lấy chi tiết 1 địa điểm' })
  @ApiResponse({ status: 200, type: PlaceResponseEntity })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const rawPlace = await this.placesService.findPlaceById(parseInt(id, 10));
    return new PlaceResponseEntity(rawPlace as any);
  }

  /**
   * UPDATE PLACE
   */
  @ApiOperation({ summary: 'Cập nhật địa điểm' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePlace(
    @Param('id') id: string,
    @Body() dto: UpdatePlaceDto,
    @CurrentUser() user: any,
  ) {
    const rawPlace = await this.placesService.updatePlace(parseInt(id, 10), dto, user.nguoidung_id, user.vaitro);
    return new PlaceResponseEntity(rawPlace as any);
  }

  /**
   * DELETE PLACE
   */
  @ApiOperation({ summary: 'Xóa địa điểm' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePlace(@Param('id') id: string, @CurrentUser() user: any) {
    return this.placesService.deletePlace(parseInt(id, 10), user.nguoidung_id, user.vaitro);
  }

  /**
   * ADMIN: UPDATE PLACE
   */
  @ApiOperation({ summary: 'Cập nhật địa điểm toàn quyền (Admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('admin/:id')
  async updatePlaceByAdmin(
    @Param('id') id: string,
    @Body() dto: UpdatePlaceDto,
    @CurrentUser() user: any,
  ) {
    const rawPlace = await this.placesService.updatePlace(parseInt(id, 10), dto, user.nguoidung_id, 'admin');
    return new PlaceResponseEntity(rawPlace as any);
  }

  /**
   * ADMIN: DELETE PLACE
   */
  @ApiOperation({ summary: 'Xóa địa điểm toàn quyền (Admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('admin/:id')
  async deletePlaceByAdmin(@Param('id') id: string, @CurrentUser() user: any) {
    return this.placesService.deletePlace(parseInt(id, 10), user.nguoidung_id, 'admin');
  }

  /**
   * UPDATE PLACE STATUS (ADMIN ONLY)
   */
  @ApiOperation({ summary: 'Cập nhật trạng thái duyệt địa điểm (Admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const rawPlace = await this.placesService.updatePlaceStatus(parseInt(id, 10), status);
    return new PlaceResponseEntity(rawPlace as any);
  }

  /**
   * LEGACY: POST /places/search
   */
  @ApiOperation({ summary: 'Tìm kiếm qua Goong Autocomplete và lưu tạm' })
  @Post('search')
  @HttpCode(200)
  async searchAndSave(@Body() dto: SearchPlaceDto) {
    return this.placesService.searchAndSave(dto.keyword, dto.session_token, dto.lat, dto.lng);
  }

  /**
   * LEGACY: POST /places/route
   */
  @ApiOperation({ summary: 'Lấy tuyến đường qua Goong Direction API' })
  @Post('route')
  @HttpCode(200)
  async getRoute(@Body() dto: GetRouteDto) {
    const profile = dto.profile || 'mapbox/driving-traffic';
    return this.placesService.getRoute(dto.placeIds, profile, dto.coordinates);
  }
}