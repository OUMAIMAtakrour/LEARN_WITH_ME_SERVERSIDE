import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/core/auth/schemas/user.schema';

export class CreateAuthDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[0-9])/, {
    message: 'password must at least contain one number',
  })
  password: string;
  @IsOptional()
  @IsEnum(UserRole)
  role: string;
}
