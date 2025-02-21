import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose from 'mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: true,
})
export class RefreshToken extends Document {
  @Prop({ required: true, unique: true })
  token: string;
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'Users' })
  userId: mongoose.Types.ObjectId;
  @Prop({ required: true })
  expiryDate: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
