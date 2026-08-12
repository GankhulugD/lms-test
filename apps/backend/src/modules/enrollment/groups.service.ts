import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CoursesService } from '../catalog/courses.service';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { AddStudentsDto } from './dto/add-students.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { Group, GroupDocument } from './schemas/group.schema';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
  ) {}

  async create(courseId: string, dto: CreateGroupDto, user: CurrentUserPayload) {
    const course = await this.coursesService.findOne(courseId);
    this.coursesService.assertOwnership(course, user);

    return this.groupModel.create({ courseId: course._id, name: dto.name });
  }

  findAllByCourse(courseId: string) {
    return this.groupModel.find({ courseId: new Types.ObjectId(courseId) }).exec();
  }

  private async findOneOrThrow(id: string) {
    const group = await this.groupModel.findById(id).exec();
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async addStudents(groupId: string, dto: AddStudentsDto, user: CurrentUserPayload) {
    const group = await this.findOneOrThrow(groupId);
    const course = await this.coursesService.findOne(group.courseId.toString());
    this.coursesService.assertOwnership(course, user);

    const students = await this.usersService.findByEmails(dto.emails);
    if (students.length === 0) {
      throw new BadRequestException('Заасан email-үүдтэй хэрэглэгч олдсонгүй');
    }

    for (const student of students) {
      // upsert: аль хэдийн элссэн бол алгасна (E11000 duplicate key-г тайван даван туулна)
      await this.enrollmentModel
        .updateOne(
          { studentId: student._id, courseId: course._id },
          { $setOnInsert: { studentId: student._id, courseId: course._id, groupId: group._id } },
          { upsert: true },
        )
        .exec();
    }

    const studentIds = students.map((s) => s._id);
    group.studentIds = Array.from(new Set([...group.studentIds.map(String), ...studentIds.map(String)])).map(
      (id) => new Types.ObjectId(id),
    );
    await group.save();

    return { addedCount: students.length, group };
  }
}
