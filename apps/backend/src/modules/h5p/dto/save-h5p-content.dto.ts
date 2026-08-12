import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

/**
 * H5P editor JS client өөрөө зөв бүтэцтэй params/metadata үүсгэдэг тул бид
 * үүнийг deep validate хийхгүй — зөвхөн бүтцийн үндэс шалгана.
 */
export class SaveH5pContentDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  params!: Record<string, any>;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  metadata!: Record<string, any>;

  @ApiProperty({ example: 'H5P.MultiChoice 1.16' })
  @IsString()
  mainLibraryUbername!: string;
}
