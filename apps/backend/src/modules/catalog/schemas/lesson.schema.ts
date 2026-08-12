import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ type: Types.ObjectId, ref: 'Section', required: true, index: true })
  sectionId!: Types.ObjectId;

  // courseId-г давхар (denormalized) хадгалж байгаа нь "тухайн course-ийн бүх
  // lesson-ыг нэг query-ээр авах" гэх мэт түгээмэл хайлтыг хялбарчлах зорилготой.
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: 0 })
  order!: number;

  // H5P контентуудыг Алхам 7-8-д энэ талбараар холбоно (contentId-нуудын жагсаалт).
  @Prop({ type: [String], default: [] })
  h5pContentIds!: string[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
