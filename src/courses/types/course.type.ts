import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/core/auth/schemas/user.schema';

@ObjectType()
export class Course {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  certified: Boolean;

  @Field(() => User)
  teacher: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  //   @Field(() => ID)
  //   media: string;
}
