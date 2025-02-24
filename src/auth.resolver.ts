import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from './core/auth/types/user.type';
import { AuthService } from './core/auth/auth.service';
import { SignupInput } from './core/auth/inputs/signup.input';

@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Mutation(() => User)
  async signup(@Args('input') signupInput: SignupInput) {
    return this.authService.signup(signupInput);
  }
}
