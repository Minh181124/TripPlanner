import { IsString, IsOptional, IsBoolean, IsDefined } from 'class-validator';
import { Transform } from 'class-transformer';
import { Coordinate } from '../interfaces/map.interface';

export class DirectionDto {
  @IsDefined()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const [lat, lng] = value.split(',').map(Number);
    return { lat, lng } as Coordinate;
  })
  origin: Coordinate;

  @IsDefined()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const [lat, lng] = value.split(',').map(Number);
    return { lat, lng } as Coordinate;
  })
  destination: Coordinate;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  alternatives?: boolean = true;

  @IsOptional()
  @IsString()
  vehicle?: string = 'car';
}
