import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  studentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId!: Types.ObjectId;

  // Хэрэв бүлгээр элссэн бол — хожим "бүлгийг устгах = бүх гишүүнийг chase
  // хийж хасах" гэх мэт үйлдэлд хэрэгтэй болно.
  @Prop({ type: Types.ObjectId, ref: 'Group', required: false })
  groupId?: Types.ObjectId;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
// Нэг сурагч нэг course-д зөвхөн 1 удаа элсэх ёстой (давхардлаас сэргийлнэ)
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
