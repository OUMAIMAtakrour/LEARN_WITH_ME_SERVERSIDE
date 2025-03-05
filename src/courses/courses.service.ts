import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { User } from 'src/core/auth/schemas/user.schema';
import { CreateCourseInput } from './inputs/create-course.input';
import { UpdateCourseInput } from './inputs/UpdateInput';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileType } from 'src/common/enums/file-type.enum';
import { FileUpload } from 'graphql-upload-ts';

async function streamToBuffer(stream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    createCourseInput: CreateCourseInput,
    creator: User,
    courseImage?: FileUpload,
  ): Promise<Course> {
    let imageUploadResult;
    if (courseImage) {
      const { createReadStream, filename, mimetype } = courseImage;
      const stream = createReadStream();
      const buffer = await streamToBuffer(stream);

      imageUploadResult = await this.fileUploadService.uploadFile(
        {
          buffer,
          originalname: filename,
          mimetype,
          size: buffer.length,
        } as Express.Multer.File,
        FileType.COURSE_IMAGE,
      );
    }

    const newCourse = new this.courseModel({
      ...createCourseInput,
      teacher: creator._id,
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
