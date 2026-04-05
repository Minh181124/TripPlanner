import { IsString } from 'class-validator';

export class GeocodeDto {
  @IsString()
  address: string;
}
