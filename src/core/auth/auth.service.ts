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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}
  async signup(registerData: SignupInput) {
    const { email, password, name, role } = registerData;
    // const createdUser = new this.UserModel({ email: registerData.email });
    const usedEmail = await this.UserModel.findOne({
      email: registerData.email,
    });
    if (usedEmail) {
      throw new BadRequestException('Email already used');
    }
    const haschedPassword = await bcrypt.hash(password, 10);
    const createdUser = await this.UserModel.create({
      name,
      email,
      password: haschedPassword,
      role: role || UserRole.STUDENT,
    });
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
  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
