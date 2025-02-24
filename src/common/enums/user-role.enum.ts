import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  TEACHER = 'teacher',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});
