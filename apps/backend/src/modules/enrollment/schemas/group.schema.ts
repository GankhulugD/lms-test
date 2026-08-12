import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GroupDocument = HydratedDocument<Group>;

/**
 * eSchool-ийн "Нэгдсэн групп" концепц: сурагчдын бүлэг (жишээ нь "8а-1"),
 * тухайн course-д багцаараа элсдэг. Ангийн бүлэг ≠ course — нэг бүлэг олон
 * course-д элсэж болно (сонгон судлах хичээл гэх мэт).
 */
@Schema({ timestamps: true })
export class Group {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  studentIds!: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
