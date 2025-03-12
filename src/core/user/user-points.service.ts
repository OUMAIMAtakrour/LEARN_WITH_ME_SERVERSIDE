import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { BadgesService } from 'src/badges/badges.service';

@Injectable()
export class UserPointsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private badgesService: BadgesService,
  ) {}

  async addPoints(userId: string, pointsToAdd: number): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $inc: { points: pointsToAdd } },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    await this.badgesService.checkAndAwardBadges(userId, user.points);

    return user;
  }

  async getUserPoints(userId: string): Promise<number> {
    const user = await this.userModel.findById(userId).select('points').exec();
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user.points;
  }
}
