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

  async getCourseDetails(courseId: string, userId: string) : Promise<unknown> {
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

    //Is the user enrolled in the course?
    const enrolled = await this.prisma.courseEnrollment.findFirst({
      where: {
        courseId: courseId,
        userId: userId
      }
    });


    // get exercise details
    const exercise_details = await this.prisma.exercises.findMany({
      where: {
        id: {
          in: exercise_ids.map((exercise) => exercise.exerciseId)
        }
      },
      orderBy: {
        day: 'asc'
      }
    });
    // check exercise locked or not if enrolled date and current date is not equal exercise.day then locked

    const mapped_exercises = exercise_details.map((exercise) => {
      return {
        ...exercise,
        is_locked: enrolled ? (
          (exercise.day + enrolled.createdAt.getDate()) === (new Date().getDate() + 1) ? false : true
        ) : true
      }
    });


    return {
      status: true,
      type: 'success',
      message: 'Course details fetched',
      code : HttpStatus.OK,
      data: {
        ...res,
        enrolled: !!enrolled,
        exercises: mapped_exercises
      }
    }
  }


  async getPopularCourses(userId: string) : Promise<unknown> {
    
    const res = await this.prisma.courses.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    const userEnrolled = await this.prisma.courseEnrollment.findMany({
      where: {
        userId: userId
      }
    });

    const result = res.map((course) => {
      const enrolled = userEnrolled.find((enrollment) => enrollment.courseId === course.id);
      return {
        ...course,
        enrolled: !!enrolled
      }
    })

    return {
      status: true,
      type: 'success',
      message: 'Courses fetched',
      code : HttpStatus.OK,
      data: result
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

  async enrollCourse(courseId: string, userId: string) : Promise<unknown> {
    const course = await this.prisma.courses.findUnique({
      where: {
        id: courseId
      }
    });
    if(!course){
      return {
        status: false,
        type: 'error',
        message: 'Course not found',
        code : HttpStatus.NOT_FOUND,
      }
    }
    const enroll = await this.prisma.courseEnrollment.create({
      data: {
        teacherId: course.teacherId,
        courseId: courseId,
        userId: userId
      }
    });
    if(!enroll){
      return {
        status: false,
        type: 'error',
        message: 'Course not enrolled',
        code : HttpStatus.BAD_REQUEST,
      }
    }
    return {
      status: true,
      type: 'success',
      message: 'Course enrolled',
      code : HttpStatus.OK,
      data: enroll
    }
  }

}
