import { forwardRef, Module } from '@nestjs/common';
import { CourseProgressService } from './course-progress.service';
import { CourseProgressResolver } from './course-progress.resolver';
import { CoursesService } from 'src/courses/courses.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CourseProgress,
  CourseProgressSchema,
} from './schemas/course-progress.schema';
import { Course, CourseSchema } from 'src/courses/schemas/course.schema';
import { UserModule } from 'src/core/user/user.module';
import { UserPointsService } from 'src/core/user/user-points.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseProgress.name, schema: CourseProgressSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  providers: [CourseProgressService],
  exports: [CourseProgressService],
})
export class CourseProgressModule {}
