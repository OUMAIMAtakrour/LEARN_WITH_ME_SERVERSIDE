import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesResolver } from './badges.resolver';

@Module({
  providers: [BadgesResolver, BadgesService],
})
export class BadgesModule {}
