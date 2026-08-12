import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SectionDocument = HydratedDocument<Section>;

@Schema({ timestamps: true })
export class Section {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: 0 })
  order!: number;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
