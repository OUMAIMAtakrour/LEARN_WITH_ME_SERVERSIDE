import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType()
@Schema()
export class Badge extends Document {
  @Field(() => ID)

  _id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  imageUrl: string;

  @Field()
  @Prop()
  description: string;

  @Field(() => Number)
  @Prop()
  pointsRequired: number;
}
export const BadgeSchema = SchemaFactory.createForClass(Badge);
