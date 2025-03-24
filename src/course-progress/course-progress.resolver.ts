import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { CourseProgressService } from './course-progress.service';
import { CourseProgress } from './schemas/course-progress.schema';
import { CreateCourseProgressInput } from './dto/create-course-progress.input';
import { UpdateCourseProgressInput } from './dto/update-course-progress.input';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/core/auth/schemas/user.schema';

@Resolver(() => CourseProgress)
export class CourseProgressResolver {
  constructor(private readonly courseProgressService: CourseProgressService) {}

  @Mutation(() => CourseProgress)
  @UseGuards(AuthGuard)
  createCourseProgress(
    @Args('input') createCourseProgressInput: CreateCourseProgressInput,
    @CurrentUser() user: any, // Use your CurrentUser decorator
  ): Promise<CourseProgress> {
    return this.courseProgressService.create({
      userId: user.id,
      courseId: createCourseProgressInput.courseId,
    });
  }

  @Query(() => [CourseProgress], { name: 'courseProgresses' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  findAll(): Promise<CourseProgress[]> {
    return this.courseProgressService.findAll();
  }

  // In your course-progress.resolver.ts
  @Query(() => CourseProgress, { nullable: true })
  @UseGuards(AuthGuard)
  async getUserCourseProgress(
    @Args('courseId') courseId: string,
    @CurrentUser() user: User,
  ): Promise<CourseProgress> {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'You must be logged in to access course progress',
      );
    }

    return this.courseProgressService.findByCourseAndUser(courseId, user.id);
  }
  @Query(() => CourseProgress, { name: 'courseProgress' })
  @UseGuards(AuthGuard)
  findOne(@Args('id', { type: () => ID }) id: string): Promise<CourseProgress> {
    return this.courseProgressService.findOne(id);
  }

  @Mutation(() => CourseProgress)
  @UseGuards(AuthGuard)
  updateCourseProgress(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateCourseProgressInput: UpdateCourseProgressInput,
  ): Promise<CourseProgress> {
    return this.courseProgressService.update(+id, updateCourseProgressInput);
  }

  @Mutation(() => CourseProgress)
  @UseGuards(AuthGuard)
  removeCourseProgress(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CourseProgress> {
    return this.courseProgressService.remove(+id);
  }

  @Mutation(() => CourseProgress)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  markCourseAsCompleted(
    @Args('userId', { type: () => String }) userId: string,
    @Args('courseId', { type: () => String }) courseId: string,
  ): Promise<CourseProgress> {
    return this.courseProgressService.markCourseAsCompleted(userId, courseId);
  }

  @Mutation(() => CourseProgress)
  @UseGuards(AuthGuard)
  updateVideoProgress(
    @Args('userId', { type: () => String }) userId: string,
    @Args('courseId', { type: () => String }) courseId: string,
    @Args('videoId', { type: () => String }) videoId: string,
    @Args('watchedSeconds', { type: () => Number }) watchedSeconds: number,
  ): Promise<CourseProgress> {
    return this.courseProgressService.updateVideoProgress(
      userId,
      courseId,
      videoId,
      watchedSeconds,
    );
  }

  @Query(() => Boolean, { name: 'isCourseCompleted' })
  @UseGuards(AuthGuard)
  isCourseCompleted(
    @Args('userId', { type: () => String }) userId: string,
    @Args('courseId', { type: () => String }) courseId: string,
  ): Promise<boolean> {
    return this.courseProgressService.isCoursesCompleted(userId, courseId);
  }

  @Query(() => [String], { name: 'completedCourses' })
  @UseGuards(AuthGuard)
  getCompletedCourses(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<string[]> {
    return this.courseProgressService.getCompletedCourses(userId);
  }
}
