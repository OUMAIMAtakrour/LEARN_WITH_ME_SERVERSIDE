import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from 'src/core/auth/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async createUser(userData) {
    try {
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      const newUser = new this.UserModel(userData);
      const savedUser = await newUser.save();

      const { password, ...userWithoutPassword } = savedUser.toObject();
      return userWithoutPassword;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Email already exists');
      }
      throw new BadRequestException('Could not create user');
    }
  }

  async updateProfile(
    selectedUserId: string,
    updateData: Partial<User>,
  ): Promise<User> {
    try {
      const user = await this.UserModel.findById(selectedUserId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await this.UserModel.findByIdAndUpdate(
        selectedUserId,
        { $set: updateData },
        { new: true },
      ).select('-password');

      if (!updatedUser) {
        throw new NotFoundException('Failed to update user');
      }

      return updatedUser;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid user ID');
      }
      throw new BadRequestException(error.message || 'Update failed');
    }
  }

  async deleteAccount(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.UserModel.findByIdAndDelete(userId);

    return { message: 'Account deleted successfully' };
  }

  async getUserProfile(userId: string) {
    try {
      const user =
        await this.UserModel.findById(userId).select('-password -__v');

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      console.error('Get Profile Error:', error);

      if (error.name === 'CastError') {
        throw new NotFoundException('Invalid user ID');
      }

      throw new BadRequestException('Could not retrieve user profile');
    }
  }

  async listUsers(currentUserRole: UserRole, page = 1, limit = 10) {
    console.log('Current User Role:', currentUserRole);
    if (currentUserRole !== UserRole.ORGANIZER) {
      throw new UnauthorizedException('Not authorized to list users');
    }

    const users = await this.UserModel.find()
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.UserModel.countDocuments();

    return {
      users,
      totalUsers: total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async logout(userId: string) {
    return { message: 'Logged out successfully' };
  }
}
