import { forwardRef, Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesResolver } from './badges.resolver';
import { UserService } from 'src/core/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Badge, BadgeSchema } from './schemas/badge.schema';
import { UserBadge, UserBadgeSchema } from './schemas/UserBadge.schema';
import { AuthModule } from 'src/core/auth/auth.module';
import { UserPointsService } from 'src/core/user/user-points.service';
import { UserModule } from 'src/core/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Badge.name, schema: BadgeSchema },
      { name: UserBadge.name, schema: UserBadgeSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  providers: [BadgesResolver, BadgesService, UserService, UserPointsService],
  exports: [
    BadgesService,
    MongooseModule.forFeature([{ name: Badge.name, schema: BadgeSchema }]),
  ],
})
export class BadgesModule {}
