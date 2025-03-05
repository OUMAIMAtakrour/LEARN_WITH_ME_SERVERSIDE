import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { FileType } from 'src/common/enums/file-type.enum';

export interface UploadedFile {
  url: string;
  key: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class FileUploadService {
  private minioClient: Client;
  private readonly logger = new Logger(FileUploadService.name);
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly cdnUrl: string;

  constructor(private configService: ConfigService) {
    this.endpoint = this.configService.get<string>('minio.endpoint');
    this.port = this.configService.get<number>('minio.port');
    this.useSSL = this.configService.get<boolean>('minio.useSSL');
    this.accessKey = this.configService.get<string>('minio.accessKey');
    this.secretKey = this.configService.get<string>('minio.secretKey');
    this.bucketName = this.configService.get<string>(
      'minio.bucketName',
      'learn-with-me',
    );
    this.cdnUrl = this.configService.get<string>('minio.cdnUrl');

    this.minioClient = new Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.accessKey,
      secretKey: this.secretKey,
    });

    this.initBucket().catch((err) => {
      this.logger.error(`Failed to initialize MinIO bucket: ${err.message}`);
    });
  }

  private async initBucket(): Promise<void> {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      this.logger.log(`Bucket '${this.bucketName}' created successfully`);

      // Set bucket policy to allow public access to objects
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify(policy),
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    fileType: FileType,
    fileName?: string,
  ): Promise<UploadedFile> {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      // Validate file type
      this.validateFileType(file, fileType);

      // Generate a unique file name
      const extension = path.extname(file.originalname);
      const uniqueFileName = fileName || `${uuidv4()}${extension}`;
      const fileKey = `${fileType}/${uniqueFileName}`;

      // Upload file to MinIO
      await this.minioClient.putObject(
        this.bucketName,
        fileKey,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      // Generate public URL
      const fileUrl = this.cdnUrl
        ? `${this.cdnUrl}/${fileKey}`
        : `${this.useSSL ? 'https' : 'http'}://${this.endpoint}:${this.port}/${this.bucketName}/${fileKey}`;

      return {
        url: fileUrl,
        key: fileKey,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileKey);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  private validateFileType(
    file: Express.Multer.File,
    fileType: FileType,
  ): void {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    switch (fileType) {
      case FileType.PROFILE_IMAGE:
      case FileType.COURSE_IMAGE:
        if (!imageTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid file type. Expected image, got ${file.mimetype}`,
          );
        }
        break;
      case FileType.COURSE_VIDEO:
        if (!videoTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid file type. Expected video, got ${file.mimetype}`,
          );
        }
        break;
      case FileType.COURSE_DOCUMENT:
        if (!documentTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid file type. Expected document, got ${file.mimetype}`,
          );
        }
        break;
    }
  }
}
