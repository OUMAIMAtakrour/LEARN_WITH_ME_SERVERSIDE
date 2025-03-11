import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateBadgeInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  imageUrl: string;

  @Field(() => Int)
  pointsRequired: number;
}
