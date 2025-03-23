import { Body, Controller, Delete, Get, Post, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CourseService } from './course.service';

//dtos
import { 
  CreateCourseDto,
  UpdateCourseDto,
  deleteCourseDto,
  CreateCourseDetailDto,
  UpdateCourseDetailDto,
  deleteCourseDetailDto,
} from './course.dto';

@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('getCourses/:teacherId')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Data' })
  getCourses(@Param('teacherId') teacherId: string){
    return this.courseService.getCourses(teacherId);
  }

  @Get('getCourseById/:courseid')
  @ApiOperation({ summary: 'Get course by id' })
  @ApiResponse({ status: 200, description: 'Data' })
  getCourseById(@Param('courseid') courseid: string){ 
    return this.courseService.getCourseById({id: courseid});
  }

  @Post('createCourse/:teacherId')
  @ApiOperation({ summary: 'Create course' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async createCourse(@Body() data: CreateCourseDto) {
    return this.courseService.createCourse(data);
  }

  @Put('updateCourse/:courseId')
  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async updateCourse(@Param('courseId') courseId: string, @Body() data: UpdateCourseDto) {
    return this.courseService.updateCourse(courseId, data);
  }

  @Delete('deleteCourse')
  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async deleteCourse(@Body() data: deleteCourseDto) {
    return this.courseService.deleteCourse(data);
  }

  
}
