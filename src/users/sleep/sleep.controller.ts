import { Body, Controller, Delete, Get, Post, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SleepService } from './sleep.service';

//dtos
import { 
  CreateSleepDto
} from './sleep.dto';

@ApiTags('sleep')
@Controller('sleep')
export class SleepController {
  constructor(private readonly sleepService: SleepService) {}

  @Post('createSleep')
  @ApiOperation({ summary: 'Create sleep' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async createSleep(@Body() data: CreateSleepDto) {
    return this.sleepService.create(data);
  }


  @Get('getSleep/:userId')
  @ApiOperation({ summary: 'Get sleep' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async getSleep(@Param('userId') userId: string) {
    return this.sleepService.getSleepTimes(userId);
  }
 
}
