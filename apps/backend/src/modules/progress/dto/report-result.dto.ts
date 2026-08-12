import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ReportResultDto {
  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @IsOptional()
  @IsString()
  verb?: string;
}
