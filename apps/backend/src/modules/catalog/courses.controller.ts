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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOneWithContent(id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.coursesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.coursesService.remove(id, user);
  }
}
