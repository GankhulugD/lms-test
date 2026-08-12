import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { AddStudentsDto } from './dto/add-students.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('courses/:courseId/groups')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateGroupDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.groupsService.create(courseId, dto, user);
  }

  @Get('courses/:courseId/groups')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  findAllByCourse(@Param('courseId') courseId: string) {
    return this.groupsService.findAllByCourse(courseId);
  }

  @Post('groups/:groupId/students')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  addStudents(
    @Param('groupId') groupId: string,
    @Body() dto: AddStudentsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.groupsService.addStudents(groupId, dto, user);
  }
}
