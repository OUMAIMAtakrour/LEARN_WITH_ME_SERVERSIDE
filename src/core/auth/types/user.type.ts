import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserRole } from 'src/common/enums/user-role.enum';

@ObjectType()
export class User {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => UserRole)
  role: UserRole;
}
