import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: '8а-1 бүлэг' })
  @IsString()
  @MinLength(2)
  name!: string;
}
