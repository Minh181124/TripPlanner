import { IsOptional, IsString, IsNumber } from 'class-validator';

export class AutocompleteDto {
  @IsString()
  input: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
