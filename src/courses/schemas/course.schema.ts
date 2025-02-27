import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/core/auth/schemas/user.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  certified: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: () => User })
  teacher: string;
}
export const CourseSchema = SchemaFactory.createForClass(Course);
