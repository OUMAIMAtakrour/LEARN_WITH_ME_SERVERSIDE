import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/core/auth/schemas/user.schema';

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
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  teacher: string;

  @Field({ nullable: true })
  @Prop()
  courseImageUrl?: string;

  @Field({ nullable: true })
  @Prop()
  courseImageKey?: string;

  @Field(() => [Course], { defaultValue: [] })
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
  courseVideos: {
    url: string;
    key: string;
    title: string;
    description?: string;
    duration?: number;
    order: number;
  }[];

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
  courseDocuments: Array<{
    url: string;
    key: string;
    title: string;
    description?: string;
    order: number;
  }>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
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

export const CourseSchema = SchemaFactory.createForClass(Course);
