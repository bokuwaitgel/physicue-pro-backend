import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { URL } from 'url';

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

  async uploadTeacherFile(file: Express.Multer.File, teacherId: string): Promise<{ location: string; key: string }> {
    const key = this.buildObjectKey(`teachers/${teacherId}`, file.originalname);
    const params: S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: key,
      Body: file.buffer,
      ContentType: this.determineMimeType(file),
      ContentDisposition: 'inline',
      ACL: 'public-read',
    };

    try {
      const result = await this.s3.upload(params).promise();
      return { location: result.Location, key };
    } catch (e) {
      console.log(e);
      throw new Error('File upload failed');
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!key) {
      return;
    }

    const params: S3.Types.DeleteObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (e) {
      console.log(e);
      throw new Error('File delete failed');
    }
  }

  async deleteFileByUrl(url: string): Promise<void> {
    const key = this.extractKeyFromUrl(url);
    if (!key) {
      throw new Error('Invalid S3 file url');
    }
    await this.deleteFile(key);
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

  private determineMimeType(file: Express.Multer.File): string {
    if (file.mimetype && file.mimetype !== 'application/octet-stream') {
      return file.mimetype;
    }

    const extension = file.originalname.split('.').pop()?.toLowerCase() || '';
    return mimeTypeMapping[extension] || mimeTypeMappingVideo[extension] || 'application/octet-stream';
  }

  private buildObjectKey(prefix: string, originalName: string): string {
    const sanitized = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.\-_/]/g, '-')
      .replace(/-+/g, '-');
    const timestamp = Date.now();
    const base = sanitized.replace(/\//g, '-');
    return `${prefix}/${timestamp}-${base}`;
  }

  private extractKeyFromUrl(url: string): string | null {
    if (!url) {
      return null;
    }

    try {
      const parsed = new URL(url);
      const bucket = process.env.AWS_BUCKET_NAME;

      if (bucket && parsed.hostname.startsWith(`${bucket}.`)) {
        return parsed.pathname.startsWith('/') ? parsed.pathname.substring(1) : parsed.pathname;
      }

      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      if (bucket && pathSegments.length > 0 && pathSegments[0] === bucket) {
        return pathSegments.slice(1).join('/');
      }

      return parsed.pathname.startsWith('/') ? parsed.pathname.substring(1) : parsed.pathname;
    } catch (error) {
      console.log(error);
      return null;
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