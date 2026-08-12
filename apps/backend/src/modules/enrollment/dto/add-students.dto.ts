import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail } from 'class-validator';

export class AddStudentsDto {
  @ApiProperty({
    example: ['student1@test.com', 'student2@test.com'],
    description: 'Бүлэгт нэгэн зэрэг нэмэх сурагчдын email жагсаалт',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  emails!: string[];
}
