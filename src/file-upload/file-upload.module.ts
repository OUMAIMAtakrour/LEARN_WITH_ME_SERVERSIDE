import { Module } from '@nestjs/common';
// import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/core/user/user.module';

@Module({
  imports: [ConfigModule,UserModule],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
