import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './types/user.type';
import { AuthService } from './auth.service';
import { SignupInput } from './inputs/signup.input';
import { LoginInput } from './inputs/login.input';
import { AuthResponse } from './types/auth-response.type';

@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Mutation(() => User)
  async signup(@Args('input') signupInput: SignupInput) {
    return this.authService.signup(signupInput);
  }
  @Mutation(() => AuthResponse)
  async login(@Args('input') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }
  @Query(() => String)
  hello() {
    return 'Hello World!';
  }
}
