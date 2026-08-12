import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { CoursesService } from './courses.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Section, SectionDocument } from './schemas/section.schema';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    private readonly coursesService: CoursesService,
  ) {}

  private async findSectionOrThrow(sectionId: string) {
    const section = await this.sectionModel.findById(sectionId).exec();
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  private async assertSectionOwnership(section: SectionDocument, user: CurrentUserPayload) {
    const course = await this.coursesService.findOne(section.courseId.toString());
    this.coursesService.assertOwnership(course, user);
  }

  async create(sectionId: string, dto: CreateLessonDto, user: CurrentUserPayload) {
    const section = await this.findSectionOrThrow(sectionId);
    await this.assertSectionOwnership(section, user);

    return this.lessonModel.create({
      ...dto,
      sectionId: section._id,
      courseId: section.courseId,
    });
  }

  findAllBySection(sectionId: string) {
    return this.lessonModel
      .find({ sectionId: new Types.ObjectId(sectionId) })
      .sort({ order: 1 })
      .exec();
  }

  private async findOneOrThrow(id: string) {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto, user: CurrentUserPayload) {
    const lesson = await this.findOneOrThrow(id);
    const section = await this.findSectionOrThrow(lesson.sectionId.toString());
    await this.assertSectionOwnership(section, user);

    Object.assign(lesson, dto);
    return lesson.save();
  }

  async remove(id: string, user: CurrentUserPayload) {
    const lesson = await this.findOneOrThrow(id);
    const section = await this.findSectionOrThrow(lesson.sectionId.toString());
    await this.assertSectionOwnership(section, user);

    await lesson.deleteOne();
  }

  /** H5P контентыг lesson-д "нийтэлсний" дараа дуудаж, лавлагаа хадгална. */
  async attachH5pContent(lessonId: string, contentId: string, user: CurrentUserPayload) {
    const lesson = await this.findOneOrThrow(lessonId);
    const section = await this.findSectionOrThrow(lesson.sectionId.toString());
    await this.assertSectionOwnership(section, user);

    if (!lesson.h5pContentIds.includes(contentId)) {
      lesson.h5pContentIds.push(contentId);
      await lesson.save();
    }
    return lesson;
  }

  async detachH5pContent(contentId: string) {
    await this.lessonModel.updateMany(
      { h5pContentIds: contentId },
      { $pull: { h5pContentIds: contentId } },
    );
  }

  /** contentId-гоор аль lesson үүнийг эзэмшдэгийг олно (эрхийн шалгалтад хэрэгтэй). */
  async findByH5pContentId(contentId: string) {
    return this.lessonModel.findOne({ h5pContentIds: contentId }).exec();
  }

  findByIdRaw(id: string) {
    return this.findOneOrThrow(id);
  }
}
