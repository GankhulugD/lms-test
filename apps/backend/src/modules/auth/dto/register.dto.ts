import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  // Аюулгүй байдлын үүднээс энд ADMIN-ийг зөвшөөрдөггүй — админ эрхийг зөвхөн
  // өөр админ/шууд DB-ээр л олгож болно, өөрөө бүртгүүлж авах ёсгүй.
  @ApiPropertyOptional({ enum: [UserRole.TEACHER, UserRole.STUDENT] })
  @IsOptional()
  @IsIn([UserRole.TEACHER, UserRole.STUDENT])
  role?: UserRole;
}