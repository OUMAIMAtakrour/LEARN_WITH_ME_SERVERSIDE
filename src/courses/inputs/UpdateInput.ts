import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { CreateCourseInput } from './create-course.input';
import { IsMongoId } from 'class-validator';

@InputType()
export class UpdateCourseInput extends PartialType(CreateCourseInput) {
  @Field(() => ID)
  @IsMongoId()
  id: string;
}
