import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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

  async createExercise(data: CreateExerciseDto) : Promise<unknown> {
    try{
      const res = await this.prisma.exercises.create({
        data: {
          name: data.name,
          description: data.description,
          purpose: data.purpose,
          duration: data.duration,
          level: data.level,
          image: data.image,
          video: data.video,
          type: data.type,
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
          message: 'Exercise not created',
          code : HttpStatus.BAD_REQUEST,
        }
      }
      return {
        status: true,
        type: 'success',
        message: 'Exercise created',
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

  async getExercises(teacherId: string) : Promise<unknown> {
    const res = await this.prisma.exercises.findMany(
      {
        where: {
          teacherId: teacherId
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

  async updateExercise(exerciseId, data: UpdateExerciseDto) : Promise<unknown> {
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
        image: data.image,
        video: data.video,
        type: data.type
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
}
