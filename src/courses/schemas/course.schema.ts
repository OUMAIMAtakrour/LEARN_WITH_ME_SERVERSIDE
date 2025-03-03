import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { User, UserSchema } from 'src/core/auth/schemas/user.schema';

export type CourseDocument = Course & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Course {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field()
  @Prop({ required: true })
  certified: boolean;

  @Field(() => User)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: () => User })
  teacher: string;

  @Field()
  createdAt: Date; 

  @Field()
  updatedAt: Date;
}
export const CourseSchema = SchemaFactory.createForClass(Course);
