import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoursesService } from '../catalog/courses.service';
import { LessonsService } from '../catalog/lessons.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ErrorCode } from '../../shared/error-codes';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { SaveH5pContentDto } from './dto/save-h5p-content.dto';
import { H5pUser } from './h5p-user';
import { H5pService } from './h5p.service';

@ApiTags('h5p-content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class H5pContentController {
  constructor(
    private readonly h5p: H5pService,
    private readonly coursesService: CoursesService,
    private readonly lessonsService: LessonsService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  @Get('lessons/:lessonId/h5p-content/new')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async newContentModel(
    @Param('lessonId') lessonId: string,
    @Query('language') language = 'en',
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.assertLessonOwnership(lessonId, user);
    return this.h5p.h5pEditor.render(undefined as any, language, new H5pUser(user));
  }

  @Post('lessons/:lessonId/h5p-content')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createContent(
    @Param('lessonId') lessonId: string,
    @Body() dto: SaveH5pContentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.assertLessonOwnership(lessonId, user);
    const h5pUser = new H5pUser(user);

    const { id, metadata } = await this.h5p.h5pEditor.saveOrUpdateContentReturnMetaData(
      undefined as any,
      dto.params,
      dto.metadata as any,
      dto.mainLibraryUbername,
      h5pUser,
    );

    await this.lessonsService.attachH5pContent(lessonId, id, user);
    return { contentId: id, metadata };
  }

  @Get('h5p-content/:contentId/edit')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async editContentModel(
    @Param('contentId') contentId: string,
    @Query('language') language = 'en',
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.assertContentOwnership(contentId, user);
    const h5pUser = new H5pUser(user);

    const [editorModel, content] = await Promise.all([
      this.h5p.h5pEditor.render(contentId, language, h5pUser),
      this.h5p.h5pEditor.getContent(contentId, h5pUser),
    ]);

    return { ...editorModel, content };
  }

  @Patch('h5p-content/:contentId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateContent(
    @Param('contentId') contentId: string,
    @Body() dto: SaveH5pContentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.assertContentOwnership(contentId, user);
    const h5pUser = new H5pUser(user);

    const { id, metadata } = await this.h5p.h5pEditor.saveOrUpdateContentReturnMetaData(
      contentId,
      dto.params,
      dto.metadata as any,
      dto.mainLibraryUbername,
      h5pUser,
    );
    return { contentId: id, metadata };
  }

  @Delete('h5p-content/:contentId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async deleteContent(@Param('contentId') contentId: string, @CurrentUser() user: CurrentUserPayload) {
    await this.assertContentOwnership(contentId, user);
    await this.h5p.h5pEditor.deleteContent(contentId, new H5pUser(user));
    await this.lessonsService.detachH5pContent(contentId);
    return { deleted: true };
  }

  @Get('h5p-content/:contentId/play')
  async playContent(
    @Param('contentId') contentId: string,
    @Query('language') language = 'en',
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.assertPlayAccess(contentId, user);
    return this.h5p.h5pPlayer.render(contentId, new H5pUser(user), language);
  }

  /** Lesson-ий эзэмшигч (course-ийн багш/admin) эсэхийг шалгана — контент ЗАСАХ эрх. */
  private async assertLessonOwnership(lessonId: string, user: CurrentUserPayload) {
    const lesson = await this.lessonsService.findByIdRaw(lessonId);
    const course = await this.coursesService.findOne(lesson.courseId.toString());
    this.coursesService.assertOwnership(course, user);
    return { lesson, course };
  }

  /** contentId-гоор харгалзах lesson-ийг олж, эзэмшлийг шалгана. */
  private async assertContentOwnership(contentId: string, user: CurrentUserPayload) {
    const lesson = await this.lessonsService.findByH5pContentId(contentId);
    if (!lesson) throw new NotFoundException(ErrorCode.H5P_CONTENT_NOT_FOUND);
    const course = await this.coursesService.findOne(lesson.courseId.toString());
    this.coursesService.assertOwnership(course, user);
    return { lesson, course };
  }

  /** ТОГЛУУЛАХ эрх: admin, эзэмшигч багш, эсвэл course-д элссэн сурагч. */
  private async assertPlayAccess(contentId: string, user: CurrentUserPayload) {
    const lesson = await this.lessonsService.findByH5pContentId(contentId);
    if (!lesson) throw new NotFoundException(ErrorCode.H5P_CONTENT_NOT_FOUND);
    const course = await this.coursesService.findOne(lesson.courseId.toString());

    if (user.role === UserRole.ADMIN || course.teacherId.toString() === user.userId) {
      return;
    }
    const enrolled = await this.enrollmentService.isEnrolled(course._id.toString(), user.userId);
    if (!enrolled) {
      throw new ForbiddenException(ErrorCode.H5P_ACCESS_DENIED);
    }
  }
}
