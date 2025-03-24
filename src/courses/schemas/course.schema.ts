import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/core/auth/schemas/user.schema';

export type CourseDocument = Course & Document;

@ObjectType()
export class CourseVideo {
  @Field()
  url: string;

  @Field()
  key: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  duration?: number;

  @Field()
  order: number;
}

@ObjectType()
export class CourseDocumentType {
  @Field()
  url: string;

  @Field()
  key: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  order: number;
}

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

  @Field()
  @Prop({ required: true })
  category: string;

  @Field(() => Number, { nullable: true })
  @Prop({ default: 0 })
  totalDuration?: number;

  @Field(() => User)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  teacher: User;

  @Field({ nullable: true })
  @Prop()
  courseImageUrl?: string;

  @Field({ nullable: true })
  @Prop()
  courseImageKey?: string;

  @Field(() => [CourseVideo], { defaultValue: [] })
  @Prop({
    type: [
      {
        url: String,
        key: String,
        title: String,
        description: String,
        duration: Number,
        order: Number,
      },
    ],
    default: [],
  })
  courseVideos: CourseVideo[];

  @Field(() => [CourseDocumentType], { defaultValue: [] })
  @Prop({
    type: [
      {
        url: String,
        key: String,
        title: String,
        description: String,
        order: Number,
      },
    ],
    default: [],
  })
  courseDocuments: CourseDocumentType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
