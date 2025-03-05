import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FileUploadService,

  UploadedFile as UploadedFileInterface,
} from './file-upload.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/core/auth/schemas/user.schema';
import { ApiTags, ApiConsumes, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FileType } from 'src/common/enums/file-type.enum';

@ApiTags('file-upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('profile-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<UploadedFileInterface> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.fileUploadService.uploadFile(
      file,
      FileType.PROFILE_IMAGE,
      `user-${user._id}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`,
    );
  }

  @Post('course-image/:courseId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload course image' })
  async uploadCourseImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('courseId') courseId: string,
  ): Promise<UploadedFileInterface> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.fileUploadService.uploadFile(
      file,
      FileType.COURSE_IMAGE,
      `course-${courseId}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`,
    );
  }

  @Post('course-video/:courseId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload course video' })
  async uploadCourseVideo(
    @UploadedFile() file: Express.Multer.File,
    @Param('courseId') courseId: string,
  ): Promise<UploadedFileInterface> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.fileUploadService.uploadFile(
      file,
      FileType.COURSE_VIDEO,
      `course-${courseId}-video-${Date.now()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`,
    );
  }

  @Post('course-document/:courseId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload course document' })
  async uploadCourseDocument(
    @UploadedFile() file: Express.Multer.File,
    @Param('courseId') courseId: string,
  ): Promise<UploadedFileInterface> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.fileUploadService.uploadFile(
      file,
      FileType.COURSE_DOCUMENT,
      `course-${courseId}-doc-${Date.now()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`,
    );
  }

  @Delete(':fileKey')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete file' })
  async deleteFile(
    @Param('fileKey') fileKey: string,
  ): Promise<{ success: boolean }> {
    const result = await this.fileUploadService.deleteFile(fileKey);
    return { success: result };
  }
}
