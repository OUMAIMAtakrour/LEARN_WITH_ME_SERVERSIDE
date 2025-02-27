import { Injectable } from '@nestjs/common';
import { CreateCourseInput } from './inputs/create-course.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseDocument ,Course} from './schemas/course.schema';
import { User } from 'src/core/auth/schemas/user.schema';
// import { UpdateCourseInput } from './dto/update-course.input';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)private courseModel:Model<CourseDocument>
  ){}
  async create(createCourseInput: CreateCourseInput,creator:User):Promise<Course> {
    const newCourse=new this.courseModel({
      ...createCourseInput,
      teacher:creator._id
    });
    return await newCourse.save();
  }

  findAll() {
    return `This action returns all courses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  // update(id: number, updateCourseInput: UpdateCourseInput) {
  //   return `This action updates a #${id} course`;
  // }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
