import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BadgesService } from './badges.service';
import { Badge } from './schemas/badge.schema';
import { CreateBadgeInput } from './inputs/create-badge.input';
import { UpdateBadgeInput } from './inputs/update-badge.input';

@Resolver(() => Badge)
export class BadgesResolver {
  constructor(private readonly badgesService: BadgesService) {}

  @Mutation(() => Badge)
  createBadge(@Args('createBadgeInput') createBadgeInput: CreateBadgeInput) {
    return this.badgesService.create(createBadgeInput);
  }

  @Query(() => [Badge], { name: 'badges' })
  findAll() {
    return this.badgesService.findAll();
  }

  @Query(() => Badge, { name: 'badge' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.badgesService.findOne(id);
  }

  @Mutation(() => Badge)
  updateBadge(@Args('updateBadgeInput') updateBadgeInput: UpdateBadgeInput) {
    return this.badgesService.update(updateBadgeInput.id, updateBadgeInput);
  }

  @Mutation(() => Badge)
  removeBadge(@Args('id', { type: () => Int }) id: number) {
    return this.badgesService.remove(id);
  }
}
