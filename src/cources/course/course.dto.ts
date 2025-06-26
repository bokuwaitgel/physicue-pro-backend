import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';

export class CreateCourseDto {
  @IsNotEmpty()
  @ApiProperty()
  title: string;
  @ApiProperty()
  @IsNotEmpty()
  duration: string;
  @ApiProperty()
  @IsNotEmpty()
  type: string;
  @ApiProperty()
  @IsNotEmpty()
  price: string;
  @ApiProperty()
  description: string;
}


export class UpdateCourseDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
  @IsNotEmpty()
  @ApiProperty()
  title: string;
  @IsNotEmpty()
  @ApiProperty()
  description: string;
  @IsNotEmpty()
  @ApiProperty()
  bannerImage: string;
  @IsNotEmpty()
  @ApiProperty()
  shortVideo: string;
  @IsNotEmpty()
  @ApiProperty()
  teacherId: string;
  @ApiProperty()
  @IsNotEmpty()
  duration: number;
  @ApiProperty()
  @IsNotEmpty()
  price: number;
}

export class deleteCourseDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}


export class getCourseByIdDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}

export class CreateCourseDetailDto {
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;
  @IsNotEmpty()
  @ApiProperty()
  title: string;
  @IsNotEmpty()
  @ApiProperty()
  detail: string;
  @IsNotEmpty()
  @ApiProperty()
  image: string;
  @IsNotEmpty()
  @ApiProperty()
  warning: string;
  @IsNotEmpty()
  @ApiProperty()
  needsInfo: string;
  @IsNotEmpty()
  @ApiProperty()
  teacherId: string;
}

export class UpdateCourseDetailDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;
  @IsNotEmpty()
  @ApiProperty()
  title: string;
  @IsNotEmpty()
  @ApiProperty()
  detail: string;
  @IsNotEmpty()
  @ApiProperty()
  image: string;
  @IsNotEmpty()
  @ApiProperty()
  warning: string;
  @IsNotEmpty()
  @ApiProperty()
  needsInfo: string;
  @IsNotEmpty()
  @ApiProperty()
  teacherId: string;
}

export class deleteCourseDetailDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}

export class getCourseDetailByIdDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}

export class enrolCourse{
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;
}