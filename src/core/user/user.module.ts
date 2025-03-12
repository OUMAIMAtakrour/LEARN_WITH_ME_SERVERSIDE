import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/core/auth/schemas/user.schema';
import { BadgesService } from 'src/badges/badges.service';
import { UserPointsService } from './user-points.service';
import { BadgesModule } from 'src/badges/badges.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    forwardRef(() => BadgesModule),
  ],
  providers: [UserService, UserPointsService, BadgesService],
  exports: [
    UserService,
    UserPointsService,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UserModule {}
