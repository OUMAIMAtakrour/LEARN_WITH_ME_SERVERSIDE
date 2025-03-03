import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { User } from 'src/core/auth/schemas/user.schema';
import { CreateCourseInput } from './inputs/create-course.input';
import { UpdateCourseInput } from './inputs/UpdateInput';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}
  async create(
    createCourseInput: CreateCourseInput,
    creator: User,
  ): Promise<Course> {
    const newCourse = new this.courseModel({
      ...createCourseInput,
      teacher: creator._id,
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
