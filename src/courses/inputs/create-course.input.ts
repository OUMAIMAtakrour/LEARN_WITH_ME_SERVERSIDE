import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateCourseInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  category: string;

  @Field()
  @IsBoolean()
  certified: boolean;
}
