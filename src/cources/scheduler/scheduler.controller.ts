import { Body, Controller, Get, Post,  Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SchedulerService } from './scheduler.service';

//dtos
import { 
  CreateSchedulerDto,
} from './scheduler.dtos';


@ApiTags('scheduler')
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}
  
  @Post('createScheduler')
  @ApiOperation({ summary: 'Create scheduler' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async createScheduler( @Body() data: CreateSchedulerDto) {
    return this.schedulerService.createScheduler(data);
  }

  @Get('getScheduler/:courseId')
  @ApiOperation({ summary: 'Get scheduler' })
  @ApiResponse({ status: 200, description: 'Data' })
  getScheduler(@Param('courseId') courseId: string){
    return this.schedulerService.getScheduler(courseId);
  }
  
  @Delete('deleteScheduler/:courseid')
  @ApiOperation({ summary: 'Delete scheduler' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async deleteScheduler( @Param('courseid') courseid: string) {
    return this.schedulerService.deleteScheduler({
      id: courseid
    });
  }

}