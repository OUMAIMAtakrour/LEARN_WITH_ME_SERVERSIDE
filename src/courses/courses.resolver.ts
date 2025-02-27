import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CoursesService } from './courses.service';
import { CreateCourseInput } from './inputs/create-course.input';
import { Course } from './types/course.type';
import { User } from 'src/core/auth/schemas/user.schema';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  @Mutation(() => Course)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.create(createCourseInput, user);
  }

  @Query(() => [Course], { name: 'courses' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Query(() => Course, { name: 'course' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.coursesService.findOne(id);
  }

  // @Mutation(() => Course)
  // updateCourse(@Args('updateCourseInput') updateCourseInput: UpdateCourseInput) {
  //   return this.coursesService.update(updateCourseInput.id, updateCourseInput);
  // }

  @Mutation(() => Course)
  removeCourse(@Args('id', { type: () => Int }) id: number) {
    return this.coursesService.remove(id);
  }
}
