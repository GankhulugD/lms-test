import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CoursesService } from '../catalog/courses.service';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { ErrorCode } from '../../shared/error-codes';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    private readonly coursesService: CoursesService,
  ) {}

  async enrollSelf(courseId: string, user: CurrentUserPayload) {
    const course = await this.coursesService.findOne(courseId);
    if (!course.published) {
      throw new ConflictException(ErrorCode.COURSE_NOT_PUBLISHED);
    }

    try {
      return await this.enrollmentModel.create({
        studentId: new Types.ObjectId(user.userId),
        courseId: course._id,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(ErrorCode.COURSE_ALREADY_ENROLLED);
      }
      throw err;
    }
  }

  findMyEnrollments(user: CurrentUserPayload) {
    return this.enrollmentModel
      .find({ studentId: new Types.ObjectId(user.userId) })
      .populate('courseId')
      .exec();
  }

  async isEnrolled(courseId: string, studentId: string): Promise<boolean> {
    const enrollment = await this.enrollmentModel
      .exists({ courseId: new Types.ObjectId(courseId), studentId: new Types.ObjectId(studentId) })
      .exec();
    return !!enrollment;
  }

  async findRoster(courseId: string, user: CurrentUserPayload) {
    const course = await this.coursesService.findOne(courseId);
    this.coursesService.assertOwnership(course, user);

    return this.enrollmentModel
      .find({ courseId: course._id })
      .populate('studentId', 'name email')
      .exec();
  }
}
