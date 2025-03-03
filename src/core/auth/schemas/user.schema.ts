import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from 'src/common/enums/user-role.enum';

@ObjectType()
@Schema()
export class User extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  email: string;

  @Field()
  @Prop({ required: true })
  password: string;

  @Field(() => UserRole)
  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
