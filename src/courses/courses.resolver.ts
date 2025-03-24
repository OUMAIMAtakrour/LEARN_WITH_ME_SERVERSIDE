import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './schemas/course.schema';
import { CreateCourseInput } from './inputs/create-course.input';
import { UpdateCourseInput } from './inputs/UpdateInput';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/core/auth/schemas/user.schema';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { processUpload } from 'src/file-upload/file-upload.resolver';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileType } from 'src/common/enums/file-type.enum';
import * as path from 'path';
import { AuthService } from 'src/core/auth/auth.service';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly fileUploadService: FileUploadService,
    private readonly usersService: AuthService,
  ) {}

  @Query(() => [Course])
  async courses(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  @ResolveField('teacher', () => User)
  async getTeacher(@Parent() course: Course) {
    const teacher = await this.usersService.findById(course.teacher.toString());
    if (teacher && !teacher.name) {
      teacher.name = 'Unnamed Teacher';
    }
    return teacher;
  }

  @Query(() => Course)
  async course(@Args('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Query(() => [Course])
  @UseGuards(AuthGuard)
  async myCourses(@CurrentUser() user: User): Promise<Course[]> {
    return this.coursesService.findByTeacher(user._id.toString());
  }

  @Query(() => [Course])
  async coursesByCategory(
    @Args('category') category: string,
  ): Promise<Course[]> {
    return this.coursesService.findByCategory(category);
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard)
  async createCourse(
    @Args('input') createCourseInput: CreateCourseInput,
    @Args({ name: 'image', type: () => GraphQLUpload, nullable: true })
    image: FileUpload,
    @CurrentUser() user: User,
  ): Promise<Course> {
    return this.coursesService.create(createCourseInput, user, image);
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard)
  async updateCourse(
    @Args('id') id: string,
    @Args('input') updateCourseInput: UpdateCourseInput,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseInput);
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard)
  async updateCourseImage(
    @Args('courseId') courseId: string,
    @Args({ name: 'image', type: () => GraphQLUpload })
    image: FileUpload,
  ): Promise<Course> {
    const file = await processUpload(image);

    const uploadResult = await this.fileUploadService.uploadFile(
      file,
      FileType.COURSE_IMAGE,
      `course-${courseId}${path.extname(file.originalname)}`,
    );

    return this.coursesService.updateCourseImage(
      courseId,
      uploadResult.url,
      uploadResult.key,
    );
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard)
  async addCourseVideo(
    @Args('courseId') courseId: string,
    @Args({ name: 'video', type: () => GraphQLUpload })
    video: FileUpload,
    @Args('title') title: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('duration', { nullable: true, type: () => Number }) duration?: number,
  ): Promise<Course> {
    const file = await processUpload(video);

    const uploadResult = await this.fileUploadService.uploadFile(
      file,
      FileType.COURSE_VIDEO,
      `course-${courseId}-video-${Date.now()}${path.extname(file.originalname)}`,
    );

    return this.coursesService.addCourseVideo(
      courseId,
      uploadResult.url,
      uploadResult.key,
      title,
      description,
      duration,
    );
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard)
  async updateCourseVideoDuration(
    @Args('courseId') courseId: string,
    @Args('videoKey') videoKey: string,
    @Args('duration', { type: () => Number }) duration: number,
  ): Promise<Course> {
    return this.coursesService.updateCourseVideoDuration(
      courseId,
      videoKey,
      duration,
    );
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard)
  async recalculateTotalDuration(
    @Args('courseId') courseId: string,
  ): Promise<Course> {
    return this.coursesService.recalculateTotalDuration(courseId);
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard)
  async addCourseDocument(
    @Args('courseId') courseId: string,
    @Args({ name: 'document', type: () => GraphQLUpload })
    document: FileUpload,
    @Args('title') title: string,
    @Args('description', { nullable: true }) description?: string,
  ): Promise<Course> {
    if (!document) {
      throw new BadRequestException('No document file provided');
    }

    const file = await processUpload(document);
    if (!file || !file.originalname) {
      throw new BadRequestException('Failed to process document upload');
    }

    const extension = path.extname(file.originalname);

    const uploadResult = await this.fileUploadService.uploadFile(
      file,
      FileType.COURSE_DOCUMENT,
      `course-${courseId}-doc-${Date.now()}${extension}`,
    );

    return this.coursesService.addCourseDocument(
      courseId,
      uploadResult.url,
      uploadResult.key,
      title,
      description,
    );
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard)
  async removeCourseVideo(
    @Args('courseId') courseId: string,
    @Args('videoKey') videoKey: string,
  ): Promise<Course> {
    return this.coursesService.removeCourseVideo(courseId, videoKey);
  }

  @Mutation(() => Course)
  @UseGuards(AuthGuard)
  async removeCourseDocument(
    @Args('courseId') courseId: string,
    @Args('documentKey') documentKey: string,
  ): Promise<Course> {
    return this.coursesService.removeCourseDocument(courseId, documentKey);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteCourse(@Args('id') id: string): Promise<boolean> {
    return this.coursesService.remove(id);
  }
}
