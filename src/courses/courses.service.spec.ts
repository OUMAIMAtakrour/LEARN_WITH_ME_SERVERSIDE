import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { Course } from './schemas/course.schema';
import { Model, Types } from 'mongoose';
import { User } from '../core/auth/schemas/user.schema';
import { CreateCourseInput } from './inputs/create-course.input';
import { FileType } from '../common/enums/file-type.enum';
import { UploadedFile } from '../file-upload/file-upload.service';
import { UserRole } from '../common/enums/user-role.enum';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseModel: Model<Course>;
  let fileUploadService: FileUploadService;

  // Create a mock User that matches the schema exactly
  const mockUser = {
    _id: new Types.ObjectId().toString(),
    name: 'Test User',
    email: 'teacher@test.com',
    password: 'hashedpassword',
    role: UserRole.TEACHER,
    points: 0,
  } as User;

  const mockCourse = {
    _id: new Types.ObjectId().toString(),
    title: 'Test Course',
    description: 'Test Description',
    certified: true,
    category: 'Test Category',
    teacher: mockUser._id,
    courseVideos: [],
    courseDocuments: [],
    save: jest.fn(),
  };

  // Mock UploadedFile that matches the interface
  const mockImageUpload: UploadedFile = {
    url: 'http://example.com/image.jpg',
    key: 'test-image-key',
    mimetype: 'image/jpeg',
    size: 1024,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getModelToken(Course.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockCourse),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
        {
          provide: FileUploadService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    courseModel = module.get<Model<Course>>(getModelToken(Course.name));
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const createCourseDto: CreateCourseInput = {
        title: 'New Course',
        description: 'New Description',
        certified: true,
        category: 'Programming',
      };

      // Mock the file upload
      const mockFileUpload = {
        createReadStream: jest.fn().mockReturnValue({
          on: jest.fn((event, callback) => {
            if (event === 'data') callback(Buffer.from('test'));
            if (event === 'end') callback();
          }),
        }),
        filename: 'test-image.jpg',
        mimetype: 'image/jpeg',
      } as any;

      // Configure mocks
      jest
        .spyOn(courseModel.prototype, 'save')
        .mockResolvedValue(mockCourse as any);
      jest
        .spyOn(fileUploadService, 'uploadFile')
        .mockResolvedValue(mockImageUpload);

      const result = await service.create(
        createCourseDto,
        mockUser,
        mockFileUpload,
      );

      expect(result).toBeDefined();
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          originalname: 'test-image.jpg',
          mimetype: 'image/jpeg',
        }),
        FileType.COURSE_IMAGE,
      );
    });

    it('should create a course without an image', async () => {
      const createCourseDto: CreateCourseInput = {
        title: 'New Course',
        description: 'New Description',
        certified: true,
        category: 'Programming',
      };

      jest
        .spyOn(courseModel.prototype, 'save')
        .mockResolvedValue(mockCourse as any);

      const result = await service.create(createCourseDto, mockUser);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Course');
    });
  });

  // Add more test cases for other methods
});
