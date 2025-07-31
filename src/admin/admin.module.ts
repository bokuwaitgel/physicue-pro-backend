import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AwsS3Service } from 'src/s3.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  providers: [AdminService, AwsS3Service, PrismaService, JwtService],
  controllers: [AdminController],
  exports: [AdminService, AwsS3Service, PrismaService, JwtService],
})
export class AdminModule {}
