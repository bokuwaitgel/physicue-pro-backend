import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

//dtos
import { 
  CreateWaterDto
} from './water.dto';

@Injectable()
export class WaterService {
  
  constructor(private prisma: PrismaService) {}

  async create(createWaterDto: CreateWaterDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: createWaterDto.userId
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
    const res = await this.prisma.waterHistory.create({
      data: {
        waterIntake: createWaterDto.waterIntake,
      }
    });
    return {
      status: true,
      type: 'success',
      message: 'Water created',
      code : HttpStatus.OK,
      data: res
    }
  }

  async getWaterIntakes(userId: string) {
    const user = await this.prisma.user.findUnique({
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

    const res = await this.prisma.waterHistory.findMany({
      where: {
        id: user.id
      }
    });
   const total_water = res.reduce((acc, curr) => acc + curr.waterIntake, 0);


    return {
      status: true,
      type: 'success',
      code : HttpStatus.OK,
      data: {
        total_water,
        waterIntakes: res
      }
    }
  }

}
