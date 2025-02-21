import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from 'src/core/auth/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from 'src/core/auth/schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}
  async signup(registerData: CreateAuthDto) {
    const { email, password, name, role } = registerData;
    const createdUser = new this.UserModel({ email: registerData.email });
    const usedEmail = await this.UserModel.findOne({
      email: registerData.email,
    });
    if (usedEmail) {
      throw new BadRequestException('Email already used');
    }
    const haschedPassword = await bcrypt.hash(password, 10);
    await this.UserModel.create({
      name,
      email,
      password: haschedPassword,
      role: role || UserRole.MEMBER,
    });
    return createdUser;
  }
  async login(loginDto: LoginDto) {
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

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '2h' });
    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);

    return { accessToken, refreshToken };
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
  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
