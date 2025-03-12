import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Badge } from './schemas/badge.schema';
import { CreateBadgeInput } from './inputs/create-badge.input';
import { UpdateBadgeInput } from './inputs/update-badge.input';
import { User } from 'src/core/auth/schemas/user.schema';
import { UserBadge } from './schemas/UserBadge.schema';
import { UserService } from 'src/core/user/user.service';

@Injectable()
export class BadgesService {
  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    @InjectModel(Badge.name) private badgeModel: Model<Badge>,
    @InjectModel(UserBadge.name) private userBadgeModel: Model<UserBadge>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createBadgeInput: CreateBadgeInput): Promise<Badge> {
    const newBadge = new this.badgeModel(createBadgeInput);
    return newBadge.save();
  }

  async findAll(): Promise<Badge[]> {
    return this.badgeModel.find().exec();
  }

  async findOne(id: string): Promise<Badge> {
    const badge = await this.badgeModel.findById(id).exec();
    if (!badge) {
      throw new NotFoundException(`Badge with ID ${id} not found`);
    }
    return badge;
  }

  async update(id: string, updateBadgeInput: UpdateBadgeInput): Promise<Badge> {
    const updatedBadge = await this.badgeModel
      .findByIdAndUpdate(id, updateBadgeInput, { new: true })
      .exec();

    if (!updatedBadge) {
      throw new NotFoundException(`Badge with ID ${id} not found`);
    }

    return updatedBadge;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.badgeModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async checkAndAwardBadges(
    userId: string,
    points: number,
  ): Promise<UserBadge[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

  
    const eligibleBadges = await this.badgeModel
      .find({ pointsRequired: { $lte: points } })
      .exec();

    const userBadges = await this.userBadgeModel
      .find({ user: userId })
      .select('badge')
      .exec();

    const userBadgeIds = userBadges.map((ub) => ub.badge.toString());

    const newEligibleBadges = eligibleBadges.filter(
      (badge) => !userBadgeIds.includes(badge._id.toString()),
    );

    const awardedBadges = [];
    for (const badge of newEligibleBadges) {
      const userBadge = new this.userBadgeModel({
        user: userId,
        badge: badge._id,
        earnedAt: new Date(),
      });
      await userBadge.save();
      awardedBadges.push(userBadge);
    }

    return awardedBadges;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return this.userBadgeModel.find({ user: userId }).populate('badge').exec();
  }
}
