import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Course {
  @Field(() => ID)
  _id: string;

  @Field()
  description: string;

  @Field()
  certified: Boolean;

  //   @Field(() => ID)
  //   media: string;
}
