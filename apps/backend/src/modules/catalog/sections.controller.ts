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
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionsService } from './sections.service';

@ApiTags('sections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post('courses/:courseId/sections')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sectionsService.create(courseId, dto, user);
  }

  @Get('courses/:courseId/sections')
  findAllByCourse(@Param('courseId') courseId: string) {
    return this.sectionsService.findAllByCourse(courseId);
  }

  @Patch('sections/:id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.sectionsService.update(id, dto, user);
  }

  @Delete('sections/:id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.sectionsService.remove(id, user);
  }
}
