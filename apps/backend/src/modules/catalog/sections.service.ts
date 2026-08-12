import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { CoursesService } from './courses.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section, SectionDocument } from './schemas/section.schema';

@Injectable()
export class SectionsService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    private readonly coursesService: CoursesService,
  ) {}

  async create(courseId: string, dto: CreateSectionDto, user: CurrentUserPayload) {
    const course = await this.coursesService.findOne(courseId);
    this.coursesService.assertOwnership(course, user);

    return this.sectionModel.create({ ...dto, courseId: course._id });
  }

  findAllByCourse(courseId: string) {
    return this.sectionModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .sort({ order: 1 })
      .exec();
  }

  private async findOneOrThrow(id: string) {
    const section = await this.sectionModel.findById(id).exec();
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(id: string, dto: UpdateSectionDto, user: CurrentUserPayload) {
    const section = await this.findOneOrThrow(id);
    const course = await this.coursesService.findOne(section.courseId.toString());
    this.coursesService.assertOwnership(course, user);

    Object.assign(section, dto);
    return section.save();
  }

  async remove(id: string, user: CurrentUserPayload) {
    const section = await this.findOneOrThrow(id);
    const course = await this.coursesService.findOne(section.courseId.toString());
    this.coursesService.assertOwnership(course, user);

    await section.deleteOne();
  }
}
