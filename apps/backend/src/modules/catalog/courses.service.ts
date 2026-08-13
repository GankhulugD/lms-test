import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { ErrorCode } from '../../shared/error-codes';
import { UserRole } from '../users/schemas/user.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';
import { Section, SectionDocument } from './schemas/section.schema';
import { Lesson, LessonDocument } from './schemas/lesson.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
  ) {}

  create(dto: CreateCourseDto, teacher: CurrentUserPayload) {
    return this.courseModel.create({ ...dto, teacherId: new Types.ObjectId(teacher.userId) });
  }

  async findAll(user: CurrentUserPayload) {
    if (user.role === UserRole.ADMIN) {
      return this.courseModel.find().sort({ createdAt: -1 }).exec();
    }
    if (user.role === UserRole.TEACHER) {
      // Багш зөвхөн өөрийн course-уудыг (нийтлэгдсэн эсэхээс үл хамааран) харна
      return this.courseModel
        .find({ teacherId: new Types.ObjectId(user.userId) })
        .sort({ createdAt: -1 })
        .exec();
    }
    // Student зөвхөн нийтлэгдсэн course-уудыг харна
    return this.courseModel.find({ published: true }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException(ErrorCode.COURSE_NOT_FOUND);
    return course;
  }

  async findOneWithContent(id: string) {
    const course = await this.findOne(id);
    const sections = await this.sectionModel
      .find({ courseId: course._id })
      .sort({ order: 1 })
      .exec();
    const lessonsBySection = await this.lessonModel
      .find({ courseId: course._id })
      .sort({ order: 1 })
      .exec();

    return {
      ...course.toObject(),
      sections: sections.map((section) => ({
        ...section.toObject(),
        lessons: lessonsBySection.filter(
          (lesson) => lesson.sectionId.toString() === section._id.toString(),
        ),
      })),
    };
  }

  async update(id: string, dto: UpdateCourseDto, user: CurrentUserPayload) {
    const course = await this.findOne(id);
    this.assertOwnership(course, user);
    Object.assign(course, dto);
    return course.save();
  }

  async remove(id: string, user: CurrentUserPayload) {
    const course = await this.findOne(id);
    this.assertOwnership(course, user);

    const sections = await this.sectionModel.find({ courseId: course._id }).exec();
    const sectionIds = sections.map((s) => s._id);

    await this.lessonModel.deleteMany({ sectionId: { $in: sectionIds } }).exec();
    await this.sectionModel.deleteMany({ courseId: course._id }).exec();
    await course.deleteOne();
  }

  /** Зөвхөн course-ийн эзэмшигч багш эсвэл admin засах/устгах эрхтэй. */
  assertOwnership(course: CourseDocument, user: CurrentUserPayload) {
    const isOwner = course.teacherId.toString() === user.userId;
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(ErrorCode.COURSE_ACCESS_DENIED);
    }
  }
}
