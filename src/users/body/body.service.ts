import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

//dtos
import { 
  CreateBodyDto,
  UpdateBodyDto
} from './body.dto';

@Injectable()
export class BodyService {
  constructor(private prisma: PrismaService) {}

  async create(body: CreateBodyDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: body.userId
      }
    });

    if (!user) {
      return {
        status: false,
        type: 'fail',
        code: HttpStatus.NOT_FOUND,
        message: 'User not found'
      };
    }
    const res = await this.prisma.bodyHistory.create({
      data: {
        weight: body.weight,
        height: body.height,
        bodyType: body.bodyType,
        age: body.age,
        birthDate: body.birthDate,
        bodyIssue: body.bodyIssue,
        userId: user.id,
        goal: body.goal
      }

    });
    return {
      status: true,
      type: 'success',
      message: 'Body created',
      code : HttpStatus.OK,
      data: res
    }
  }

  async update(body: UpdateBodyDto) {
    const find = await this.prisma.bodyHistory.findUnique({
      where: {
        id: body.userId
      }
    });

    if (!find) {
      return {
        status: false,
        type: 'fail',
        code: HttpStatus.NOT_FOUND,
        message: 'Body not found'
      };
    }
  
    const res = await this.prisma.bodyHistory.update({
      where: {
        id: body.userId
      },
      data: body
    });
    return {
      status: true,
      type: 'success',
      message: 'Body updated',
      code : HttpStatus.OK,
      data: res
    }
  }

  async getBody(userId: string) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId
        }
      });

      if (!user) {
        return {
          status: false,
          type: 'fail',
          code: HttpStatus.NOT_FOUND,
          message: 'Personal not found'
        };
      }
      const res = await this.prisma.bodyHistory.findFirst({
        where: {
          userId: user.id
        }
      });
  
      if (!res) {
        return {
          status: false,
          type: 'fail',
          code: HttpStatus.NOT_FOUND,
          message: 'Body not found'
        };
      }
      return {
        status: true,
        type: 'success',
        message: 'Body found',
        code : HttpStatus.OK,
        data: res
      }
  }
}
