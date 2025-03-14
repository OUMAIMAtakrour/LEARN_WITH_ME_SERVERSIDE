import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CourseProgressService } from './course-progress.service';
import { CourseProgress } from './schemas/course-progress.schema';
import { CreateCourseProgressInput } from './dto/create-course-progress.input';
import { UpdateCourseProgressInput } from './dto/update-course-progress.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Resolver(() => CourseProgress)
export class CourseProgressResolver {
  constructor(private readonly courseProgressService: CourseProgressService) {}

  @Mutation(() => CourseProgress)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createCourseProgress(
    @Args('input') createCourseProgressInput: CreateCourseProgressInput,
  ): Promise<CourseProgress> {
    return this.courseProgressService.create(createCourseProgressInput);
  }

  @Query(() => [CourseProgress], { name: 'courseProgresses' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(): Promise<CourseProgress[]> {
    return this.courseProgressService.findAll();
  }

  @Query(() => CourseProgress, { name: 'courseProgress' })
  @UseGuards(AuthGuard)
  findOne(@Args('id', { type: () => ID }) id: string): Promise<CourseProgress> {
    return this.courseProgressService.findOne(+id);
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
