import { Body, Controller, Delete, Get, Post, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { FoodService } from './food.service';

//dtos
import { 
  createFoodDto
} from './food.dto';

@ApiTags('food')
@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post('createFood')
  @ApiOperation({ summary: 'Create food' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async createFood(@Body() data: createFoodDto) {
    return this.foodService.create(data);
  }

  @Get('getFood/:userId')
  @ApiOperation({ summary: 'Get food' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async getFood(@Param('userId') userId: string) {
    return this.foodService.getCaloriesIntakes(userId);
  }

  @Get('getFoodById/:id')
  @ApiOperation({ summary: 'Get food by id' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async getFoodById(@Param('id') id: string) {
    return this.foodService.getCaloriesIntake(id);
  }


}
