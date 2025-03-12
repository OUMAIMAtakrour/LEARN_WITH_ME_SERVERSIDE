import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/core/auth/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/core/auth/schemas/refresh-token.schema';
import { AuthResolver } from 'src/core/auth/auth.resolver';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { BadgesService } from 'src/badges/badges.service';
import { BadgesModule } from 'src/badges/badges.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
    ]),
    BadgesModule,
  ],
  providers: [AuthService, AuthResolver, FileUploadService],
  exports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    AuthService, 
  ],
})
export class AuthModule {}
