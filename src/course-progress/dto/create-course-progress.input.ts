import { InputType, Int, Field } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@InputType()
export class CreateCourseProgressInput {
  @Field(() => String, { description: 'User ID' })
  @IsMongoId()
  userId: string;

  @Field(() => String, { description: 'Course ID' })
  @IsMongoId()
  courseId: string;
}
