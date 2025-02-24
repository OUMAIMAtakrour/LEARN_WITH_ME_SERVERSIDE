// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   Logger,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Observable } from 'rxjs';
// import { Request } from 'express';
// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(private jwtService: JwtService) {}

//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromHeader(request);

//     if (!token) {
//       throw new UnauthorizedException('No token provided');
//     }

//     try {
//       const payload = this.jwtService.verify(token, {
//         secret: process.env.JWT_SECRET,
//       });

//       request.user = {
//         userId: payload.userId,
//         role: payload.role,
//       };

//       return true;
//     } catch (error) {
//       console.error('Token verification error:', error);
//       throw new UnauthorizedException('Invalid token');
//     }
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const authHeader = request.headers.authorization;
//     if (!authHeader) return undefined;

//     const [type, token] = authHeader.split(' ');
//     return type === 'Bearer' ? token : undefined;
//   }
// }
