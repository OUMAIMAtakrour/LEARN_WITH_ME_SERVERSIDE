import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesResolver } from './courses.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import { AuthModule } from 'src/core/auth/auth.module';
import { UserModule } from 'src/core/user/user.module';
import { User, UserSchema } from 'src/core/auth/schemas/user.schema';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    UserModule,
    FileUploadModule,
  ],
  providers: [CoursesResolver, CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
