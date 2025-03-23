import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

//dtos
import { 
  createFoodDto
} from './food.dto';

@Injectable()
export class FoodService {
  
  constructor(private prisma: PrismaService) {}

  async create(createFoodDto: createFoodDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: createFoodDto.userId
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
    const res = await this.prisma.caloriesHistory.create({
      data: {
        name: createFoodDto.name,
        caloriesIntake: createFoodDto.calories,
        userId: user.id
      }
    });
    return {
      status: true,
      type: 'success',
      message: 'Food created',
      code : HttpStatus.OK,
      data: res
    }
  }

  async getCaloriesIntakes(userId: string) {
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
        message: 'User not found'
      };
    }
    const res = await this.prisma.caloriesHistory.findMany({
      where: {
        userId: user.id
      }
    });
   const total_calories = res.reduce((acc, curr) => acc + curr.caloriesIntake, 0);
   return {
     status: true,
     type: 'success',
     message: 'Calories intake',
     code : HttpStatus.OK,
     data: {
        total_calories,
        history: res
     }
   }
  }

  async getCaloriesIntake(id: string) {

    const res = await this.prisma.caloriesHistory.findUnique({
      where: {
        id: id
      }
    });
    return {
      status: true,
      type: 'success',
      message: 'Calories intake',
      code : HttpStatus.OK,
      data: res
    }
  }


}
