import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ContentResultDocument = HydratedDocument<ContentResult>;

/**
 * Сурагч тухайн H5P контенттой хэрхэн харилцсаныг хадгална (H5P client-ийн
 * xAPI event-үүдээс гаралтай). Нэг (studentId, contentId) хослолд ганцхан
 * бичлэг байх ба шинэ оролдлого бүрт дээрээс нь update хийнэ (upsert).
 */
@Schema({ timestamps: true })
export class ContentResult {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  studentId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  contentId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, index: true })
  lessonId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId!: Types.ObjectId;

  // Контентыг наад зах нь нээж үзсэн эсэх (score/completion шаардахгүй).
  @Prop({ default: false })
  opened!: boolean;

  @Prop({ default: 0 })
  openCount!: number;

  @Prop()
  score?: number;

  @Prop()
  maxScore?: number;

  @Prop({ default: false })
  completed!: boolean;

  @Prop()
  success?: boolean;

  // xAPI verb-ийн сүүлийн утга (жиш: "answered", "completed") — дебаг/дэлгэрэнгүйд хэрэгтэй.
  @Prop()
  verb?: string;

  @Prop({ default: 0 })
  attempts!: number;
}

export const ContentResultSchema = SchemaFactory.createForClass(ContentResult);
ContentResultSchema.index({ studentId: 1, contentId: 1 }, { unique: true });
