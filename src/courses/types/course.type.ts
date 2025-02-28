import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/core/auth/schemas/user.schema';
import { UserType } from 'src/core/auth/types/user.type';

@ObjectType()
export class CourseType {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  certified: Boolean;

  @Field(() => UserType)
  teacher: UserType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  //   @Field(() => ID)
  //   media: string;
}
