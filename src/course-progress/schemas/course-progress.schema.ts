import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
class VideoProgress {
  @Field(() => String)
  @Prop({ required: true })
  videoId: string;

  @Field(() => Number)
  @Prop({ default: 0 })
  watchedSeconds: number;

  @Field(() => Boolean)
  @Prop({ default: false })
  completed: boolean;
}

@ObjectType()
@Schema({ timestamps: true })
export class CourseProgress extends Document {
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  userId: string;

  @Field(() => String)
  @Prop({ required: true })
  courseId: string;

  @Field(() => [VideoProgress])
  @Prop({ type: [Object], default: [] })
  videosProgress: VideoProgress[];

  @Field(() => Boolean)
  @Prop({ default: false })
  completed: boolean;

  @Field(() => Date, { nullable: true })
  @Prop()
  completedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}


export const CourseProgressSchema =
  SchemaFactory.createForClass(CourseProgress);

  CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
