import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/core/auth/schemas/user.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  certified: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User })
  teacher: User;
}
export const CourseSchema = SchemaFactory.createForClass(Course);
