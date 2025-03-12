import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BadgesService } from './badges.service';
import { Badge } from './schemas/badge.schema';
import { UserBadge } from './schemas/UserBadge.schema';
import { CreateBadgeInput } from './inputs/create-badge.input';
import { UpdateBadgeInput } from './inputs/update-badge.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Resolver(() => Badge)
export class BadgesResolver {
  constructor(private readonly badgesService: BadgesService) {}

  @Mutation(() => Badge)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createBadge(
    @Args('input') createBadgeInput: CreateBadgeInput,
  ): Promise<Badge> {
    return this.badgesService.create(createBadgeInput);
  }

  @Query(() => [Badge], { name: 'badges' })
  findAll(): Promise<Badge[]> {
    return this.badgesService.findAll();
  }

  @Query(() => Badge, { name: 'badge' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Badge> {
    return this.badgesService.findOne(id);
  }

  @Mutation(() => Badge)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateBadge(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateBadgeInput: UpdateBadgeInput,
  ): Promise<Badge> {
    return this.badgesService.update(id, updateBadgeInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  removeBadge(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.badgesService.remove(id);
  }

  @Query(() => [UserBadge])
  @UseGuards(AuthGuard)
  userBadges(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<UserBadge[]> {
    return this.badgesService.getUserBadges(userId);
  }
}
