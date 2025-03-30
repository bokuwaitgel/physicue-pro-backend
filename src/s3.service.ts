import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class AwsS3Service {
  private s3: S3;
  constructor() {
    this.s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
      region: process.env.AWS_REGION,
    });
  }
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const key = 'images/' + Date.now() + '.' + fileExtension;

    const mimeType =
      file.mimetype === 'application/octet-stream'
        ? mimeTypeMapping[fileExtension || '']
        : file.mimetype;
    const params: S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: key,
      Body: file.buffer,
      ContentType: mimeType,
      ContentDisposition: 'inline',
      ACL: 'public-read',
    };
    try {
      let result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (e) {
      console.log(e);
      throw new Error('File upload failed');
    }
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const key = 'profiles/' + Date.now() + '.' + fileExtension;

    const mimeType =
      file.mimetype === 'application/octet-stream'
        ? mimeTypeMapping[fileExtension || '']
        : file.mimetype;
    const params: S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: key,
      Body: file.buffer,
      ContentType: mimeType,
      ContentDisposition: 'inline',
      ACL: 'public-read',
    };
    try {
      let result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (e) {
      console.log(e);
      throw new Error('File upload failed');
    }
  }

  async uploadStorieImage(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const key = 'stories/' + Date.now() + '.' + fileExtension;

    const mimeType =
      file.mimetype === 'application/octet-stream'
        ? mimeTypeMapping[fileExtension || '']
        : file.mimetype;
    const params: S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: key,
      Body: file.buffer,
      ContentType: mimeType,
      ContentDisposition: 'inline',
      ACL: 'public-read',
    };
    try {
      let result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (e) {
      console.log(e);
      throw new Error('File upload failed');
    }
  }

  async uploadWorkoutVideo(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const key = 'workout/' + Date.now() + '.' + fileExtension;

    const mimeType =
      file.mimetype === 'application/octet-stream'
        ? mimeTypeMappingVideo[fileExtension || '']
        : file.mimetype;
    const params: S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: key,
      Body: file.buffer,
      ContentType: mimeType,
      ContentDisposition: 'inline',
      ACL: 'public-read',
    };
    try {
      let result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (e) {
      console.log(e);
      throw new Error('File upload failed');
    }
  }
}


const mimeTypeMapping: { [key: string]: string } = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  tiff: 'image/tiff',
  ico: 'image/vnd.microsoft.icon',
};

const mimeTypeMappingVideo: { [key: string]: string } = {
  mp4: 'video/mp4',
  avi: 'video/x-msvideo',
  flv: 'video/x-flv',
  wav: 'audio/x-wav',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  wmv: 'video/x-ms-wmv',
  mpg: 'video/mpeg',
  mpeg: 'video/mpeg',
};