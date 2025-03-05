import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { CoursesService } from './courses.service';
import { CreateCourseInput } from './inputs/create-course.input';
import { User } from 'src/core/auth/schemas/user.schema';
import { Inject, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateCourseInput } from './inputs/UpdateInput';
import { Course } from './schemas/course.schema';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(
    private readonly coursesService: CoursesService,
  ) {}

  @Mutation(() => Course)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
    @Args({ name: 'courseImage', type: () => GraphQLUpload, nullable: true })
    courseImage?: FileUpload,
    @CurrentUser() user?: User,
  ) {
    return this.coursesService.create(
      createCourseInput,
      user ,
      courseImage,
    );
  }
  @Query(() => [Course], { name: 'courses' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Query(() => Course, { name: 'course' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.coursesService.findOne(id);
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  updateCourse(
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.update(updateCourseInput.id, updateCourseInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  removeCourse(@Args('id', { type: () => ID }) id: string) {
    return this.coursesService.remove(id);
  }

  @Query(() => [Course], { name: 'coursesByTeacher' })
  findCoursesByTeacher(
    @Args('teacherId', { type: () => ID }) teacherId: string,
  ) {
    return this.coursesService.findByTeacher(teacherId);
  }

  @Query(() => [Course], { name: 'myCourses' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  findMyCourses(@CurrentUser() user: User) {
    return this.coursesService.findByTeacher(user._id.toString());
  }
}
