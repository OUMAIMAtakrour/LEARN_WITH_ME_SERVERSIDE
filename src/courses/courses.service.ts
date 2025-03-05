import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { User } from 'src/core/auth/schemas/user.schema';
import { CreateCourseInput } from './inputs/create-course.input';
import { UpdateCourseInput } from './inputs/UpdateInput';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileType } from 'src/common/enums/file-type.enum';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private fileUploadService: FileUploadService,
  ) {}
  async create(
    createCourseInput: CreateCourseInput,
    creator: User,
    courseImage?: Express.Multer.File,
  ): Promise<Course> {
    // Validate course image if provided
    let imageUploadResult;
    if (courseImage) {
      imageUploadResult = await this.fileUploadService.uploadFile(
        courseImage,
        FileType.COURSE_IMAGE,
      );
    }

    const newCourse = new this.courseModel({
      ...createCourseInput,
      teacher: creator._id,
      // Add image details if uploaded
      ...(imageUploadResult && {
        courseImageUrl: imageUploadResult.url,
        courseImageKey: imageUploadResult.key,
      }),
    });

    return await newCourse.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  async findOne(id: string): Promise<Course> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid course ID: ${id}`);
    }

    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }

    return course;
  }

  async updateCourseImage(
    courseId: string,
    imageUrl: string,
    imageKey: string,
  ): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID '${courseId}' not found`);
    }

    // Delete old image if exists
    if (course.courseImageKey) {
      try {
        await this.fileUploadService.deleteFile(course.courseImageKey);
      } catch (error) {
        console.error('Failed to delete old course image:', error);
      }
    }

    return this.courseModel
      .findByIdAndUpdate(
        courseId,
        {
          courseImageUrl: imageUrl,
          courseImageKey: imageKey,
        },
        { new: true },
      )
      .exec();
  }

  async addCourseVideo(
    courseId: string,
    videoUrl: string,
    videoKey: string,
    title: string,
    description?: string,
    duration?: number,
  ): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID '${courseId}' not found`);
    }

    // Get the highest order to place the new video at the end
    const highestOrder =
      course.courseVideos.length > 0
        ? Math.max(...course.courseVideos.map((v) => v.order))
        : -1;

    const newVideo = {
      url: videoUrl,
      key: videoKey,
      title,
      description,
      duration,
      order: highestOrder + 1,
    };

    return this.courseModel
      .findByIdAndUpdate(
        courseId,
        {
          $push: { courseVideos: newVideo },
        },
        { new: true },
      )
      .exec();
  }

  async addCourseDocument(
    courseId: string,
    documentUrl: string,
    documentKey: string,
    title: string,
    description?: string,
  ): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID '${courseId}' not found`);
    }

    // Get the highest order
    const highestOrder =
      course.courseDocuments.length > 0
        ? Math.max(...course.courseDocuments.map((d) => d.order))
        : -1;

    const newDocument = {
      url: documentUrl,
      key: documentKey,
      title,
      description,
      order: highestOrder + 1,
    };

    return this.courseModel
      .findByIdAndUpdate(
        courseId,
        {
          $push: { courseDocuments: newDocument },
        },
        { new: true },
      )
      .exec();
  }

  async removeCourseVideo(courseId: string, videoKey: string): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID '${courseId}' not found`);
    }

    // Delete the file from storage
    try {
      await this.fileUploadService.deleteFile(videoKey);
    } catch (error) {
      console.error('Failed to delete course video:', error);
    }

    return this.courseModel
      .findByIdAndUpdate(
        courseId,
        {
          $pull: { courseVideos: { key: videoKey } },
        },
        { new: true },
      )
      .exec();
  }

  async removeCourseDocument(
    courseId: string,
    documentKey: string,
  ): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID '${courseId}' not found`);
    }

    // Delete the file from storage
    try {
      await this.fileUploadService.deleteFile(documentKey);
    } catch (error) {
      console.error('Failed to delete course document:', error);
    }

    return this.courseModel
      .findByIdAndUpdate(
        courseId,
        {
          $pull: { courseDocuments: { key: documentKey } },
        },
        { new: true },
      )
      .exec();
  }
  async update(
    id: string,
    updateCourseInput: UpdateCourseInput,
  ): Promise<Course> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid course ID: ${id}`);
    }

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(
        id,
        { $set: updateCourseInput },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }

    return updatedCourse;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid course ID: ${id}`);
    }

    const result = await this.courseModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }

    return true;
  }

  async findByTeacher(teacherId: string): Promise<Course[]> {
    if (!Types.ObjectId.isValid(teacherId)) {
      throw new NotFoundException(`Invalid teacher ID: ${teacherId}`);
    }

    return this.courseModel.find({ teacher: teacherId }).exec();
  }
}
