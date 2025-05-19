import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ScanParamsDto {
  @IsNumber()
  @IsNotEmpty()
  startBlock: number;

  @IsNumber()
  @IsOptional()
  endBlock?: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;
}