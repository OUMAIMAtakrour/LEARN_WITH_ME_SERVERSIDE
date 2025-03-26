import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { FileType } from '../enums/file-type.enum';

@Injectable()
export class extensionValidation implements PipeTransform {
  transform(value: string) {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const videoTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mpeg',
      'video/quicktime',
    ];
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

if(!value)
    return value;
  }
}


