import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseProgressInput } from './dto/create-course-progress.input';
import { UpdateCourseProgressInput } from './dto/update-course-progress.input';
import { CourseProgress } from './schemas/course-progress.schema';
import { UserPointsService } from 'src/core/user/user-points.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from 'src/courses/schemas/course.schema';

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectModel(CourseProgress.name)
    private progressModel: Model<CourseProgress>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private userPointsService: UserPointsService,
  ) {}

  async create({
    userId,
    courseId,
  }: {
    userId: string;
    courseId: string;
  }): Promise<CourseProgress> {
    // First check if the user is already enrolled in this course
    const existingProgress = await this.progressModel
      .findOne({
        userId,
        courseId,
      })
      .exec();

    if (existingProgress) {
      // Return the existing progress instead of creating a duplicate
      return existingProgress;
    }

    // If not enrolled, create a new progress record
    const newProgress = new this.progressModel({
      userId,
      courseId,
      videosProgress: [],
      completed: false,
    });
    return newProgress.save();
  }

  async findAll(): Promise<CourseProgress[]> {
    return this.progressModel.find().exec();
  }

  async findOne(id: string): Promise<CourseProgress> {
    // Changed parameter type to string
    const progress = await this.progressModel.findById(id).exec();
    if (!progress) {
      throw new NotFoundException(`Course progress with ID ${id} not found`);
    }
    return progress;
  }
  // In your course-progress.service.ts
  async findByCourseAndUser(
    courseId: string,
    userId: string,
  ): Promise<CourseProgress> {
    const progress = await this.progressModel
      .findOne({
        courseId,
        userId,
      })
      .exec();

    if (!progress) {
      throw new NotFoundException(`You are not enrolled in this course`);
    }

    return progress;
  }

  async update(
    id: number,
    updateCourseProgressInput: UpdateCourseProgressInput,
  ): Promise<CourseProgress> {
    const updatedProgress = await this.progressModel
      .findByIdAndUpdate(id, updateCourseProgressInput, { new: true })
      .exec();

    if (!updatedProgress) {
      throw new NotFoundException(`Course progress with ID ${id} not found`);
    }

    return updatedProgress;
  }

  async remove(id: number): Promise<CourseProgress> {
    const deletedProgress = await this.progressModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedProgress) {
      throw new NotFoundException(`Course progress with ID ${id} not found`);
    }
    return deletedProgress;
  }

  async updateVideoProgress(
    userId: string,
    courseId: string,
    videoId: string,
    watchedSeconds: number,
  ): Promise<CourseProgress> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    let progress = await this.progressModel
      .findOne({
        userId,
        courseId,
      })
      .exec();

    if (!progress) {
      progress = new this.progressModel({
        userId,
        courseId,
        videosProgress: [],
        completed: false,
      });
    }

    const videoIndex = progress.videosProgress.findIndex(
      (v) => v.videoId === videoId,
    );

    const videoFromCourse = course.courseVideos.find((v) => {
      const videoIdentifier = (v as any)._id
        ? (v as any)._id.toString()
        : v.key;
      return videoIdentifier === videoId;
    });

    if (!videoFromCourse) {
      throw new NotFoundException(
        `Video with ID ${videoId} not found in course`,
      );
    }

    const videoDuration = videoFromCourse.duration || 0;
    const isVideoCompleted = watchedSeconds >= videoDuration * 0.9;

    if (videoIndex >= 0) {
      progress.videosProgress[videoIndex].watchedSeconds = watchedSeconds;
      progress.videosProgress[videoIndex].completed = isVideoCompleted;
    } else {
      progress.videosProgress.push({
        videoId,
        watchedSeconds,
        completed: isVideoCompleted,
      });
    }

    const allVideosCompleted = course.courseVideos.every((courseVideo) => {
      const videoId = (courseVideo as any)._id
        ? (courseVideo as any)._id.toString()
        : courseVideo.key;

      const progressVideo = progress.videosProgress.find(
        (v) => v.videoId === videoId,
      );
      return progressVideo && progressVideo.completed;
    });

    if (!progress.completed && allVideosCompleted) {
      progress.completed = true;
      progress.completedAt = new Date();
      await progress.save();

      const COURSE_COMPLETION_POINTS = 50;
      await this.userPointsService.addPoints(userId, COURSE_COMPLETION_POINTS);

      return progress;
    }

    return progress.save();
  }

  async markCourseAsCompleted(
    userId: string,
    courseId: string,
  ): Promise<CourseProgress> {
    const progress = await this.progressModel
      .findOneAndUpdate(
        { userId, courseId },
        {
          completed: true,
          completedAt: new Date(),
        },
        { new: true, upsert: true },
      )
      .exec();

    const COURSE_COMPLETION_POINTS = 50;
    await this.userPointsService.addPoints(userId, COURSE_COMPLETION_POINTS);

    return progress;
  }

  async isCoursesCompleted(userId: string, courseId: string): Promise<boolean> {
    const progress = await this.progressModel
      .findOne({
        userId,
        courseId,
        completed: true,
      })
      .exec();

    return !!progress;
  }

  async getCompletedCourses(userId: string): Promise<string[]> {
    const completedProgressDocs = await this.progressModel
      .find({
        userId,
        completed: true,
      })
      .exec();

    return completedProgressDocs.map((doc) => doc.courseId);
  }
}
