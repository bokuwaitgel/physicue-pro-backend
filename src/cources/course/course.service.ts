import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AwsS3Service } from 'src/s3.service';

//dtos
import { 
  CreateCourseDto,
  UpdateCourseDto,
  deleteCourseDto,
  getCourseByIdDto,
  CreateCourseDetailDto,
  UpdateCourseDetailDto,
  deleteCourseDetailDto,
  getCourseDetailByIdDto,
} from './course.dto';

@Injectable()
export class CourseService {
  
  constructor(private prisma: PrismaService) {}

  async createCourse(data: CreateCourseDto) : Promise<unknown> {
    try{

      const res = await this.prisma.courses.create({
        data: {
          title: data.title,
          description: data.description,
          bannerImage: data.bannerImage,
          shortVideo: data.shortVideo,
          duration: data.duration,
          teacher: {
            connect: {
              id: data.teacherId
            }
          }
        }
      });
      if(!res){
        return {
          status: false,
          type: 'error',
          message: 'Course not created',
          code : HttpStatus.BAD_REQUEST,
        }
      }
      return {
        status: true,
        type: 'success',
        message: 'Course created',
        code : HttpStatus.OK,
        data: res
      }
    }catch(e){
      return {
        status: false,
        type: 'error',
        message: e.message,
        code : HttpStatus.BAD_REQUEST,
      }
    }
  }

  async getCourses(teacherId: string) : Promise<unknown> {
    const res = await this.prisma.courses.findMany({
      where: {
        teacherId: teacherId
      }
    });
    return {
      status: true,
      type: 'success',
      message: 'Courses fetched',
      code : HttpStatus.OK,
      data: res
    }
  }

  async getCourseById(data: getCourseByIdDto)
  {
    const res = await this.prisma.courses.findUnique({
      where: {
        id: data.id
      }
    });
    return {
      status: true,
      type: 'success',
      message: 'Course fetched',
      code : HttpStatus.OK,
      data: res
    }
  }

  async updateCourse(courseId: string, data: UpdateCourseDto) : Promise<unknown> {
    console.log(courseId);
    const find = await this.prisma.courses.findUnique({
      where: {
        id: courseId
      }
    });
    if(!find) {
      return {
        status: false,
        type: 'error',
        message: 'Course not found',
        code : HttpStatus.NOT_FOUND,
      }
    }
    const res = await this.prisma.courses.update({
      where: {
        id: find.id
      },
      data: {
        title: data.title,
        description: data.description,
        bannerImage: data.bannerImage,
        shortVideo: data.shortVideo,
        duration: data.duration,
        teacher: {
          connect: {
            id: data.teacherId
          }
        }
      }
    });
    return {
      status: true,
      type: 'success',
      message: 'Course updated',
      code : HttpStatus.OK,
      data: res
    }
  }

  async deleteCourse(data: deleteCourseDto) : Promise<unknown> {
    const find = await this.prisma.courses.findUnique({
      where: {
        id: data.id
      }
    });
    if(find)
    {
      await this.prisma.courses.delete({
        where: {
          id: data.id
        }
      });
      return {
        status: true,
        type: 'success',
        message: 'Course deleted',
        code : HttpStatus.OK,
      }
    }
    else
    {
      return {
        status: false,
        type: 'error',
        message: 'Course not found',
        code : HttpStatus.NOT_FOUND,
      }
    }
  }

  async getCourseDetails(courseId: string) : Promise<unknown> {
    const res = await this.prisma.courses.findFirst({
      where: {
        id: courseId
      }
    });

    const exercise_ids = await this.prisma.courseExercises.findMany({
      where: {
        courseId: courseId
      }
    });

    const course_exercises: Array<{ id: string; description: string; status: string; teacherId: string; createdAt: Date; updatedAt: Date; name: string; purpose: string; duration: number; level: string; type: string; image: string; video: string; }> = [];
    for(let i = 0; i < exercise_ids.length; i++)
    {
      const exercise = await this.prisma.exercises.findUnique({
        where: {
          id: exercise_ids[i].exerciseId
        }
      });
      if (!exercise) {
        continue;
      }
      course_exercises.push(exercise);
    }


    return {
      status: true,
      type: 'success',
      message: 'Course details fetched',
      code : HttpStatus.OK,
      data: {
        ...res,
        exercises: course_exercises
      }
    }
  }


  async getPopularCourses() : Promise<unknown> {
    const res = await this.prisma.courses.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return {
      status: true,
      type: 'success',
      message: 'Courses fetched',
      code : HttpStatus.OK,
      data: res
    }
  }

  async uploadCourseImage(courseId: string, image: any){
    const s3 = new AwsS3Service();
    const cource = await this.prisma.courses.findUnique({
      where: {
        id: courseId
      }
    });
    if(!cource){
      return {
        status: false,
        type: 'error',
        message: 'Course not found',
        code : HttpStatus.NOT_FOUND,
      }
    }
    try {
      const res = await s3.uploadFile(image);
      if(!res){
        return {
          status: false,
          type: 'error',
          message: 'Image not uploaded',
          code : HttpStatus.BAD_REQUEST,
        }
      }
      const update = await this.prisma.courses.update({
        where: {
          id: courseId
        },
        data: {
          bannerImage: res
        }
      });
      return {
        status: true,
        type: 'success',
        message: 'Image uploaded',
        data: update,
        code : HttpStatus.OK,
      }
    }
    catch(e){
      return {
        status: false,
        type: 'error',
        message: e.message,
        code : HttpStatus.BAD_REQUEST,
      }
    }
  }

  async uploadShortVideo(courseId: string, video: any){
    const s3 = new AwsS3Service();
    const cource = await this.prisma.courses.findUnique({
      where: {
        id: courseId
      }
    });
    if(!cource){
      return {
        status: false,
        type: 'error',
        message: 'Course not found',
        code : HttpStatus.NOT_FOUND,
      }
    }
    try {
      const res = await s3.uploadWorkoutVideo(video);
      if(!res){
        return {
          status: false,
          type: 'error',
          message: 'Video not uploaded',
          code : HttpStatus.BAD_REQUEST,
        }
      }
      const update = await this.prisma.courses.update({
        where: {
          id: courseId
        },
        data: {
          shortVideo: res
        }
      });

      return {
        status: true,
        type: 'success',
        message: 'Video uploaded',
        data: update,
        code : HttpStatus.OK,
      }
    }
    catch(e){
      return {
        status: false,
        type: 'error',
        message: e.message,
        code : HttpStatus.BAD_REQUEST,
      }
    }
  }

}
