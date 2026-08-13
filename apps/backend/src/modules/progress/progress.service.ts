import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CoursesService } from '../catalog/courses.service';
import { LessonsService } from '../catalog/lessons.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { ErrorCode } from '../../shared/error-codes';
import { ReportResultDto } from './dto/report-result.dto';
import { ContentResult, ContentResultDocument } from './schemas/content-result.schema';

export interface StudentProgressRow {
  studentId: string;
  name: string;
  email: string;
  opened: boolean;
  completed: boolean;
  score?: number;
  maxScore?: number;
  attempts: number;
  updatedAt?: Date;
}

export interface ContentProgress {
  contentId: string;
  totalStudents: number;
  openedCount: number;
  completedCount: number;
  students: StudentProgressRow[];
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(ContentResult.name) private resultModel: Model<ContentResultDocument>,
    private readonly lessonsService: LessonsService,
    private readonly coursesService: CoursesService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  /** contentId-гоор эзэмшигч lesson/course-ийг олж, {lessonId, courseId} буцаана. */
  private async resolveContentOwner(contentId: string) {
    const lesson = await this.lessonsService.findByH5pContentId(contentId);
    if (!lesson) throw new NotFoundException(ErrorCode.H5P_CONTENT_NOT_FOUND);
    return { lessonId: lesson._id, courseId: lesson.courseId };
  }

  /** Сурагч контентыг нээж үзсэнийг тэмдэглэнэ (оноо/дуусгалт шаардахгүй). */
  async recordOpen(contentId: string, user: CurrentUserPayload) {
    const { lessonId, courseId } = await this.resolveContentOwner(contentId);

    await this.resultModel
      .findOneAndUpdate(
        { studentId: new Types.ObjectId(user.userId), contentId },
        {
          $set: { opened: true },
          $inc: { openCount: 1 },
          $setOnInsert: { lessonId, courseId },
        },
        { upsert: true },
      )
      .exec();

    return { ok: true };
  }

  /** Сурагчийн xAPI үр дүнг (оноо, дуусгалт) хадгална. */
  async recordResult(contentId: string, user: CurrentUserPayload, dto: ReportResultDto) {
    const { lessonId, courseId } = await this.resolveContentOwner(contentId);

    await this.resultModel
      .findOneAndUpdate(
        { studentId: new Types.ObjectId(user.userId), contentId },
        {
          $set: {
            opened: true,
            score: dto.score,
            maxScore: dto.maxScore,
            completed: dto.completed ?? false,
            success: dto.success,
            verb: dto.verb,
          },
          $inc: { attempts: 1 },
          $setOnInsert: { lessonId, courseId },
        },
        { upsert: true },
      )
      .exec();

    return { ok: true };
  }

  /** Тухайн lesson-ий бүх H5P контент, бүх элссэн сурагчаар нь задалсан явцын тайлан (зөвхөн эзэмшигч багш/admin). */
  async getLessonProgress(lessonId: string, user: CurrentUserPayload) {
    const lesson = await this.lessonsService.findByIdRaw(lessonId);
    const course = await this.coursesService.findOne(lesson.courseId.toString());
    this.coursesService.assertOwnership(course, user);

    const roster = await this.enrollmentService.findRoster(course._id.toString(), user);
    const students = roster
      .map((enrollment) => {
        const student = enrollment.studentId as any;
        if (!student || typeof student === 'string') return null;
        return { studentId: student._id.toString(), name: student.name, email: student.email };
      })
      .filter((s): s is { studentId: string; name: string; email: string } => s !== null);

    const results = await this.resultModel
      .find({ lessonId: lesson._id })
      .lean()
      .exec();

    const contents: ContentProgress[] = lesson.h5pContentIds.map((contentId) => {
      const contentResults = results.filter((r) => r.contentId === contentId);
      const byStudent = new Map(contentResults.map((r) => [r.studentId.toString(), r]));

      const studentRows: StudentProgressRow[] = students.map((s) => {
        const r = byStudent.get(s.studentId);
        return {
          studentId: s.studentId,
          name: s.name,
          email: s.email,
          opened: r?.opened ?? false,
          completed: r?.completed ?? false,
          score: r?.score,
          maxScore: r?.maxScore,
          attempts: r?.attempts ?? 0,
          updatedAt: (r as any)?.updatedAt,
        };
      });

      return {
        contentId,
        totalStudents: students.length,
        openedCount: studentRows.filter((s) => s.opened).length,
        completedCount: studentRows.filter((s) => s.completed).length,
        students: studentRows,
      };
    });

    return { lessonId: lesson._id.toString(), contents };
  }
}
