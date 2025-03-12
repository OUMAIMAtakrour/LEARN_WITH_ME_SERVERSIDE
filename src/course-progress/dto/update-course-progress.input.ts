import { CreateCourseProgressInput } from './create-course-progress.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCourseProgressInput extends PartialType(CreateCourseProgressInput) {
  @Field(() => Int)
  id: number;
}
