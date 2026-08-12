import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import { Section, SectionSchema } from './schemas/section.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [CoursesController, SectionsController, LessonsController],
  providers: [CoursesService, SectionsService, LessonsService],
  exports: [CoursesService, LessonsService],
})
export class CatalogModule {}
