import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/core/auth/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/core/auth/schemas/refresh-token.schema';
import { AuthResolver } from 'src/core/auth/auth.resolver';

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
  ],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
