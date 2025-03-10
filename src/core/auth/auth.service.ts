import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/core/auth/schemas/user.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from 'src/core/auth/schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { SignupInput } from './inputs/signup.input';
import { LoginInput } from './inputs/login.input';
import { AuthResponse } from './types/auth-response.type';
import { FileUpload } from 'graphql-upload-ts';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileType } from 'src/common/enums/file-type.enum';
import { processUpload } from 'src/file-upload/file-upload.resolver';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
    private fileUploadService: FileUploadService,
  ) {}

  async signup(registerData: SignupInput, profileImage?: FileUpload) {
    const { email, password, name, role } = registerData;

    const usedEmail = await this.UserModel.findOne({
      email: registerData.email,
    });

    if (usedEmail) {
      throw new BadRequestException('Email already used');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.STUDENT,
      profileImageUrl: null,
      profileImageKey: null,
    };

    if (profileImage) {
      try {
        const file = await processUpload(profileImage);

        const uploadResult = await this.fileUploadService.uploadFile(
          file,
          FileType.PROFILE_IMAGE,
          `user-profile-${Date.now()}-${uuidv4().substring(0, 8)}${
            file.originalname ? '.' + file.originalname.split('.').pop() : ''
          }`,
        );

        userData.profileImageUrl = uploadResult.url;
        userData.profileImageKey = uploadResult.key;
      } catch (error) {
        console.error('Failed to upload profile image:', error);
      }
    }

    const createdUser = await this.UserModel.create(userData);
    return createdUser;
  }

  async login(loginDto: LoginInput): Promise<AuthResponse> {
    const user = await this.UserModel.findOne({ email: loginDto.email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateUserTokens(user._id.toString());
    return tokens;
  }

  async generateUserTokens(userId) {
    const access_token = this.jwtService.sign({ userId }, { expiresIn: '2h' });
    const refresh_token = uuidv4();
    await this.storeRefreshToken(refresh_token, userId);

    return { access_token, refresh_token };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });
    if (!token) {
      throw new UnauthorizedException();
    }
    return this.generateUserTokens(token.userId);
  }

  async storeRefreshToken(token: string, userId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    console.log(userId);
    console.log(token);
    console.log(expiryDate);

    await this.RefreshTokenModel.create({ token, userId, expiryDate });
  }

  async updateProfileImage(userId: string, profileImage: FileUpload) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const file = await processUpload(profileImage);

    if (user.profileImageKey) {
      try {
        await this.fileUploadService.deleteFile(user.profileImageKey);
      } catch (error) {
        console.error('Failed to delete old profile image:', error);
      }
    }

    const uploadResult = await this.fileUploadService.uploadFile(
      file,
      FileType.PROFILE_IMAGE,
      `user-profile-${userId}-${Date.now()}${
        file.originalname ? '.' + file.originalname.split('.').pop() : ''
      }`,
    );

    const updatedUser = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        profileImageUrl: uploadResult.url,
        profileImageKey: uploadResult.key,
      },
      { new: true },
    );

    return updatedUser;
  }
}
