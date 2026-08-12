import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  teacherId!: Types.ObjectId;

  // Ирээдүйд сургууль/байгууллагаар тусгаарлах (multi-tenancy) шаардлага гарвал
  // одооноос энэ талбарыг migration хийхгүйгээр ашиглах боломжтой байхын тулд.
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: false, index: true })
  organizationId?: Types.ObjectId;

  @Prop({ default: false })
  published!: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
