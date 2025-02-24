import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/common/enums/user-role.enum';

@InputType()
export class SignupInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  password: string;
  @Field()
  @IsOptional()
  @IsEnum(UserRole)
  role?: string;
}
