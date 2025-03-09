import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FileUploadService, UploadedFile } from './file-upload.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from 'src/core/auth/schemas/user.schema';
import { FileType } from 'src/common/enums/file-type.enum';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

export class UploadedFileResponse {
  url: string;
  key: string;
  mimetype: string;
  size: number;
}

export async function processUpload(
  upload: FileUpload,
): Promise<Express.Multer.File> {
  console.log('Processing upload:', upload);
  if (!upload || typeof upload.createReadStream !== 'function') {
    console.error('Invalid upload object:', upload);
    throw new BadRequestException('Invalid upload object');
  }

  const { createReadStream, filename, mimetype } = upload;
  console.log('File details:', { filename, mimetype });

  const stream = createReadStream();

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

  return {
    buffer,
    originalname: filename,
    mimetype,
    size: buffer.length,
  } as Express.Multer.File;
}

@Resolver('FileUpload')
export class FileUploadResolver {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Mutation(() => UploadedFileResponse)
  @UseGuards(AuthGuard)
  async uploadProfileImage(
    @Args({ name: 'file', type: () => GraphQLUpload })
    upload: FileUpload,
    @CurrentUser() user: User,
  ): Promise<UploadedFile> {
    if (!upload) {
      throw new BadRequestException('No file uploaded');
    }

    const file = await processUpload(upload);
    const extension = path.extname(file.originalname);

    return this.fileUploadService.uploadFile(
      file,
      FileType.PROFILE_IMAGE,
      `user-${user._id}${extension}`,
    );
  }

  @Mutation(() => UploadedFileResponse)
  @UseGuards(AuthGuard)
  async uploadCourseImage(
    @Args({ name: 'file', type: () => GraphQLUpload })
    upload: FileUpload,
    @Args('courseId') courseId: string,
  ): Promise<UploadedFile> {
    if (!upload) {
      throw new BadRequestException('No file uploaded');
    }

    const file = await processUpload(upload);
    const extension = path.extname(file.originalname);

    return this.fileUploadService.uploadFile(
      file,
      FileType.COURSE_IMAGE,
      `course-${courseId}${extension}`,
    );
  }

  @Mutation(() => UploadedFileResponse)
  @UseGuards(AuthGuard)
  async uploadCourseVideo(
    @Args({ name: 'file', type: () => GraphQLUpload })
    upload: FileUpload,
    @Args('courseId') courseId: string,
  ): Promise<UploadedFile> {
    if (!upload) {
      throw new BadRequestException('No file uploaded');
    }

    const file = await processUpload(upload);
    const extension = path.extname(file.originalname);

    return this.fileUploadService.uploadFile(
      file,
      FileType.COURSE_VIDEO,
      `course-${courseId}-video-${Date.now()}${extension}`,
    );
  }

  @Mutation(() => UploadedFileResponse)
  @UseGuards(AuthGuard)
  async uploadCourseDocument(
    @Args({ name: 'file', type: () => GraphQLUpload })
    upload: FileUpload,
    @Args('courseId') courseId: string,
  ): Promise<UploadedFile> {
    if (!upload) {
      throw new BadRequestException('No file uploaded');
    }

    const file = await processUpload(upload);
    const extension = path.extname(file.originalname);

    return this.fileUploadService.uploadFile(
      file,
      FileType.COURSE_DOCUMENT,
      `course-${courseId}-doc-${Date.now()}${extension}`,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteFile(@Args('fileKey') fileKey: string): Promise<boolean> {
    return this.fileUploadService.deleteFile(fileKey);
  }
}
