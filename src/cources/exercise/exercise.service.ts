import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AwsS3Service } from 'src/s3.service';
//dtos
import { 
  CreateExerciseDto,
  UpdateExerciseDto,
  deleteExerciseDto,
  getExerciseByIdDto,
  addExerciseToCourseDto
} from './exercise.dto';

@Injectable()
export class ExerciseService {
  
  constructor(private prisma: PrismaService) {}

  async createExercise(data: CreateExerciseDto, video: any, userId: string) : Promise<unknown> {
    try{

      const teacher = await this.prisma.teacher.findFirst({
        where: {
          userId: userId
        }
      });

      if(!teacher) {
        return {
          status: false,
          type: 'failed',
          message: 'Teacher not found',
          code : HttpStatus.NOT_FOUND,
        }
      }
      const teacherId = teacher.id;

      const res = await this.prisma.exercises.create({
        data: {
          name: data.name,
          day: parseInt(data.day),
          level: data.level,
          type: data.type,
          teacher: {
            connect: {
              id: teacherId
            }
        }
        }
      });
      if(!res){
        return {
          status: false,
          type: 'error',
          message: 'Exercise not created',
          code : HttpStatus.BAD_REQUEST,
        }
      }

      const result = await this.uploadExerciseVideo(res.id, video);

      //check course
      const course = await this.prisma.courses.findUnique({
        where: {
          id: data.courseId
        }
      });

      if(course) {
        const tt = await this.prisma.courseExercises.create({
          data: {
            courses: {
              connect: {
                id: data.courseId
              }
            },
            exercises: {
              connect: {
                id: res.id
              }
            }
          }
        });
        console.log('course', tt);
      }

      //get latest exercise
      const latestExercise = await this.prisma.exercises.findUnique({
        where: {
          id: res.id
        }
      });

      return {
        status: true,
        type: 'success',
        message: 'Exercise created',
        code : HttpStatus.OK,
        data: latestExercise
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

  async getExercises(teacherId: string) : Promise<unknown> {
    const res = await this.prisma.exercises.findMany(
      {
        where: {
          teacherId: teacherId
        },
        orderBy: {
          day: 'asc'
        }
      }
    );
    return {
      status: true,
      type: 'success',
      message: 'Exercises fetched',
      code : HttpStatus.OK,
      data: res
    }
  }

  async getExerciseById(data: getExerciseByIdDto)
  {
    const res = await this.prisma.exercises.findUnique({
      where: {
        id: data.id
      }
    });
    return {
      status: true,
      type: 'success',
      message: 'Exercise fetched',
      code : HttpStatus.OK,
      data: res
    }
  }

  async updateExercise(exerciseId: string, data: UpdateExerciseDto) : Promise<unknown> {
    const find = await this.prisma.exercises.findUnique({
      where: {
        id: exerciseId
      }
    });
    if(!find) {
      return {
        status: false,
        type: 'failed',
        message: 'Exercise not found',
        code : HttpStatus.NOT_FOUND,
      }
    }
    const res = await this.prisma.exercises.update({
      where: {
        id: exerciseId
      },
      data: {
        name: data.name,
        description: data.description,
        purpose: data.purpose,
        day: data.day,
        level: data.level,
        type: data.type,
        image: data.image,
        video: data.video
      }
    });



    return {
      status: true,
      type: 'success',
      message: 'Exercise updated',
      code : HttpStatus.OK,
      data: res
    }
  }

  async deleteExercise(data: deleteExerciseDto) : Promise<unknown> {
    const find = await this.prisma.exercises.findUnique({
      where: {
        id: data.id
      }
    });
    if(!find) {
      return {
        status: false,
        type: 'failed',
        message: 'Exercise not found',
        code : HttpStatus.NOT_FOUND,
      }
    }
    const res = await this.prisma.exercises.delete({
      where: {
        id: data.id
      }
    });
    return {
      status: true,
      type: 'success',
      message: 'Exercise deleted',
      code : HttpStatus.OK,
      data: res
    }
  }

  async addExerciseToCourse(data: addExerciseToCourseDto) : Promise<unknown> {
    const find = await this.prisma.courses.findUnique({
      where: {
        id: data.courseId
      }
    });
    if(!find) {
      return {
        status: false,
        type: 'failed',
        message: 'Course not found',
        code : HttpStatus.NOT_FOUND,
      }
    }
    try{
      const res = await this.prisma.courseExercises.create({
        data: {
          courses: {
            connect: {
              id: data.courseId
            }
          },
          exercises: {
            connect: {
              id: data.exerciseId
            }
          }
        }
      });
      return {
        status: true,
        type: 'success',
        message: 'Exercise added to course',
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

  async getPopularExercises() {
    const data = await this.prisma.exercises.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      status: true,
      type: 'success',
      message: 'Exercises fetched',
      code : HttpStatus.OK,
      data: data
    }
  }

  async uploadExerciseImage(exirciseId: string, file: Express.Multer.File) {
    const s3 = new AwsS3Service();
    const exercise = await this.prisma.exercises.findUnique({
      where: {
        id: exirciseId
      }
    });
    if(!exercise) {
      return {
        status: false,
        type: 'failed',
        message: 'Exercise not found',
        code : HttpStatus.NOT_FOUND,
      }
    }

    try {
      const res = await s3.uploadFile(file);
      const update = await this.prisma.exercises.update({
        where: {
          id: exercise?.id
        },
        data: {
          image: res
        }
      });

      return {
        status: true,
        type: 'success',
        message: 'Image uploaded',
        code : HttpStatus.OK,
        data: update
      }

    }
    catch(e) {
      return {
        status: false,
        type: 'error',
        message: e.message,
        code : HttpStatus.BAD_REQUEST,
      }
    }
  }

  async uploadExerciseVideo(exirciseId: string, file: Express.Multer.File) {
    const s3 = new AwsS3Service();
    const exercise = await  this.prisma.exercises.findUnique({
      where: {
        id: exirciseId
      }
    });
    if(!exercise) {
      return {
        status: false,
        type: 'failed',
        message: 'Exercise not found',
        code : HttpStatus.NOT_FOUND,
      }
    }

    try {
      const res = await s3.uploadWorkoutVideo(file);
      const update = await this.prisma.exercises.update({
        where: {
          id: exirciseId
        },
        data: {
          video: res
        }
      });

      return {
        status: true,
        type: 'success',
        message: 'Video uploaded',
        code : HttpStatus.OK,
        data: update
      }

    }
    catch(e) {
      return {
        status: false,
        type: 'error',
        message: e.message,
        code : HttpStatus.BAD_REQUEST,
      }
    }
  }

}
