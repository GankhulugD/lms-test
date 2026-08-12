import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { EnrollmentService } from './enrollment.service';

@ApiTags('enrollment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('courses/:courseId/enroll')
  @Roles(UserRole.STUDENT)
  enrollSelf(@Param('courseId') courseId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.enrollmentService.enrollSelf(courseId, user);
  }

  @Get('me/enrollments')
  @Roles(UserRole.STUDENT)
  findMyEnrollments(@CurrentUser() user: CurrentUserPayload) {
    return this.enrollmentService.findMyEnrollments(user);
  }

  @Get('courses/:courseId/roster')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  findRoster(@Param('courseId') courseId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.enrollmentService.findRoster(courseId, user);
  }
}
