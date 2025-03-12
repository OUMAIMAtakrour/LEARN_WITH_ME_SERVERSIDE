import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CourseProgressService } from './course-progress.service';
import { CourseProgress } from './schemas/course-progress.schema';
import { CreateCourseProgressInput } from './dto/create-course-progress.input';
import { UpdateCourseProgressInput } from './dto/update-course-progress.input';

@Resolver(() => CourseProgress)
export class CourseProgressResolver {
  constructor(private readonly courseProgressService: CourseProgressService) {}

  @Mutation(() => CourseProgress)
  createCourseProgress(
    @Args('createCourseProgressInput')
    createCourseProgressInput: CreateCourseProgressInput,
  ) {
    return this.courseProgressService.create(createCourseProgressInput);
  }

  @Query(() => [CourseProgress], { name: 'allCourseProgress' })
  findAll() {
    return this.courseProgressService.findAll();
  }

  @Query(() => CourseProgress, { name: 'courseProgress' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.courseProgressService.findOne(+id);
  }

  @Mutation(() => CourseProgress)
  updateCourseProgress(
    @Args('updateCourseProgressInput')
    updateCourseProgressInput: UpdateCourseProgressInput,
  ) {
    return this.courseProgressService.update(
      updateCourseProgressInput.id,
      updateCourseProgressInput,
    );
  }

  @Mutation(() => CourseProgress)
  removeCourseProgress(@Args('id', { type: () => Int }) id: number) {
    return this.courseProgressService.remove(id);
  }

  @Mutation(() => CourseProgress)
  updateVideoProgress(
    @Args('userId') userId: string,
    @Args('courseId') courseId: string,
    @Args('videoId') videoId: string,
    @Args('watchedSeconds') watchedSeconds: number,
  ) {
    return this.courseProgressService.updateVideoProgress(
      userId,
      courseId,
      videoId,
      watchedSeconds,
    );
  }

  @Mutation(() => CourseProgress)
  markCourseAsCompleted(
    @Args('userId') userId: string,
    @Args('courseId') courseId: string,
  ) {
    return this.courseProgressService.markCourseAsCompleted(userId, courseId);
  }

  @Query(() => Boolean, { name: 'isCoursesCompleted' })
  isCoursesCompleted(
    @Args('userId') userId: string,
    @Args('courseId') courseId: string,
  ) {
    return this.courseProgressService.isCoursesCompleted(userId, courseId);
  }

  @Query(() => [String], { name: 'getCompletedCourses' })
  getCompletedCourses(@Args('userId') userId: string) {
    return this.courseProgressService.getCompletedCourses(userId);
  }
}
