import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { ReportResultDto } from './dto/report-result.dto';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('h5p-content/:contentId/open')
  @Roles(UserRole.STUDENT)
  reportOpen(@Param('contentId') contentId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.progressService.recordOpen(contentId, user);
  }

  @Post('h5p-content/:contentId/result')
  @Roles(UserRole.STUDENT)
  reportResult(
    @Param('contentId') contentId: string,
    @Body() dto: ReportResultDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.progressService.recordResult(contentId, user, dto);
  }

  @Get('lessons/:lessonId/progress')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  getLessonProgress(@Param('lessonId') lessonId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.progressService.getLessonProgress(lessonId, user);
  }
}
