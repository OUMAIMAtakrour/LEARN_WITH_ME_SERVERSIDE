// import {
//   createParamDecorator,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';

// export const CurrentUser = createParamDecorator(
//   (data: unknown, context: ExecutionContext) => {
//     const request = context.switchToHttp().getRequest();

//     if (!request.user) {
//       throw new UnauthorizedException('User information not found');
//     }

//     return request.user;
//   },
// );
