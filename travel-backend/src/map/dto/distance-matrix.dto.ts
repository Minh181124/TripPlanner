import { IsString, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { Coordinate } from '../interfaces/map.interface';

export class DistanceMatrixDto {
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.split(';').map((coord: string) => {
      const [lat, lng] = coord.split(',').map(Number);
      return { lat, lng } as Coordinate;
    });
  })
  origins: Coordinate[];

  @IsArray()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.split(';').map((coord: string) => {
      const [lat, lng] = coord.split(',').map(Number);
      return { lat, lng } as Coordinate;
    });
  })
  destinations: Coordinate[];

  @IsOptional()
  @IsString()
  vehicle?: string = 'car';
}
