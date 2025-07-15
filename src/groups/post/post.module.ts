import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AwsS3Service } from 'src/s3.service';

@Module({
  providers: [PostService, AuthService, PrismaService, JwtAuthGuard, JwtService, UsersService, AwsS3Service],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
