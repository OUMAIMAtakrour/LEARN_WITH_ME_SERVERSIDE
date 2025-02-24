import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './types/user.type';
import { AuthService } from './auth.service';
import { SignupInput } from './inputs/signup.input';


@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Mutation(() => User)
  async signup(@Args('input') signupInput: SignupInput) {
    return this.authService.signup(signupInput);
  }
  @Query(() => String)
  hello() {
    return 'Hello World!';
  }
}
