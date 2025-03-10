import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupInput } from './inputs/signup.input';
import { LoginInput } from './inputs/login.input';
import { AuthResponse } from './types/auth-response.type';
import { User } from './schemas/user.schema';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Mutation(() => User)
  async signup(
    @Args('input') signupInput: SignupInput,
    @Args({ name: 'profileImage', type: () => GraphQLUpload, nullable: true })
    profileImage?: FileUpload,
  ): Promise<User> {
    return this.authService.signup(signupInput, profileImage);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }
   @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updateProfileImage(
    @Args({ name: 'profileImage', type: () => GraphQLUpload })
    profileImage: FileUpload,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.authService.updateProfileImage(user._id.toString(), profileImage);
  }

  @Query(() => String)
  hello() {
    return 'Hello World!';
  }
}
