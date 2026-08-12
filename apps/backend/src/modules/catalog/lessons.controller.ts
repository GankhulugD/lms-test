import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsService } from './lessons.service';

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post('sections/:sectionId/lessons')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lessonsService.create(sectionId, dto, user);
  }

  @Get('sections/:sectionId/lessons')
  findAllBySection(@Param('sectionId') sectionId: string) {
    return this.lessonsService.findAllBySection(sectionId);
  }

  @Get('lessons/:id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findByIdRaw(id);
  }

  @Patch('lessons/:id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lessonsService.update(id, dto, user);
  }

  @Delete('lessons/:id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.lessonsService.remove(id, user);
  }
}
