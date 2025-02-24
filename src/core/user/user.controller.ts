// import {
//   Controller,
//   Put,
//   Delete,
//   Get,
//   Body,
//   Param,
//   UseGuards,
//   Request,
//   Query,
//   Post,
//   Req,
//   Patch,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { UserService } from './user.service';
// import { AuthGuard } from 'src/common/guards/auth.guard';
// // import { Roles } from '../auth/roles.decorator';
// import { User } from 'src/core/auth/schemas/user.schema';
// import { Roles } from 'src/common/decorators/role.decorator';
// import { RolesGuard } from 'src/common/guards/roles.guard';
// import { SignupInput } from '../auth/inputs/signup.input';
// import { UserRole } from 'src/common/enums/user-role.enum';

// @Controller('users')
// @UseGuards(AuthGuard, RolesGuard)
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Post()
//   async createUser(@Body() create: SignupInput, @Request() req) {
//     return this.userService.createUser(create);
//   }

//   @Patch('/profile/:id')
//   async updateProfile(
//     @Param('id') selectedUserId: string,
//     @Body() updateData: Partial<User>,
//   ) {
//     return this.userService.updateProfile(selectedUserId, updateData);
//   }

//   @Get('/profile')
//   async getProfile(@Req() req) {
//     console.log('User ID from token:', req.user.userId);

//     return this.userService.getUserProfile(req.user.userId);
//   }
//   @Delete('account/:userId')
//   async deleteAccount(@Param('userId') userId: string) {
//     return this.userService.deleteAccount(userId);
//   }
//   @Get('list')

//   // @Roles(UserRole.ORGANIZER)
//   async listUsers(@Req() req) {
//     console.log('Request User:', req.user);

//     return this.userService.listUsers(req.user.role);
//   }

//   @Post('logout')
//   async logout(@Request() req) {
//     return this.userService.logout(req.user.userId);
//   }
// }
