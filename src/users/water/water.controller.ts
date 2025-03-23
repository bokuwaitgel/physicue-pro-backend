import { Body, Controller, Delete, Get, Post, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { WaterService } from './water.service';

//dtos
import { 
  CreateWaterDto,
} from './water.dto';

@ApiTags('water')
@Controller('water')
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @Post('createWater')
  @ApiOperation({ summary: 'Create water' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async createWater(@Body() data: CreateWaterDto) {
    return this.waterService.create(data);
  }

  @Get('getWater/:userId')
  @ApiOperation({ summary: 'Get water' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async getWater(@Param('userId') userId: string) {
    return this.waterService.getWaterIntakes(userId);
  }

 
}
