import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUrl, IsInt } from 'class-validator';

@InputType()
export class CreateBadgeInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  pointsRequired: number;
}
