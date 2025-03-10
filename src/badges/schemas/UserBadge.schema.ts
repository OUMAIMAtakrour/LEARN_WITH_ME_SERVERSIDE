import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/core/auth/schemas/user.schema';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Badge } from './badge.schema';

@ObjectType()
@Schema()
export class UserBadge extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Field()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Badge', required: true })
  badge: Badge;

  @Field()
  @Prop({ default: Date.now })
  earnedAt: Date;
}

export const UserBadgeSchema = SchemaFactory.createForClass(UserBadge);
