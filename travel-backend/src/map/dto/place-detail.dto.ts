import { IsString } from 'class-validator';

export class PlaceDetailDto {
  @IsString()
  place_id: string;
}
