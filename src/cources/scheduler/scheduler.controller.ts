import { Body, Controller, Get, Post,  Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { SchedulerService } from './scheduler.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

//dtos
import { 
  CreateSchedulerDto,
} from './scheduler.dtos';


@ApiTags('scheduler')
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}
  
  @Post('createScheduler')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create scheduler' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async createScheduler( @Body() data: CreateSchedulerDto) {
    return this.schedulerService.createScheduler(data);
  }

  @Get('getScheduler/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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