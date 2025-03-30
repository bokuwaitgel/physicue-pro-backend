import { Body, Controller, Delete, Get, Post, Put, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
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
import { FileInterceptor } from '@nestjs/platform-express';

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


  @Get('getCourseDetails/:courseId')
  @ApiOperation({ summary: 'Get course details' })
  @ApiResponse({ status: 200, description: 'Data' })
  getCourseDetails(@Param('courseId') courseId: string){
    return this.courseService.getCourseDetails(courseId);
  }


  @Get('getPopularCourses')
  @ApiOperation({ summary: 'Get popular courses' })
  @ApiResponse({ status: 200, description: 'Data' })
  getPopularCourses(){
    return this.courseService.getPopularCourses();
  }

  @Post('uploadCourseBanner/:courseId')
  @UseInterceptors(FileInterceptor('file'))
  uploadProfileImage(
      @UploadedFile() file: Express.Multer.File,
      @Param('courseId') id: string
  ) {
      return this.courseService.uploadCourseImage(id, file);
  }

  @Post('uploadShortVideo/:courseId')
  @UseInterceptors(FileInterceptor('file'))
  uploadShortVideo(
      @UploadedFile() file: Express.Multer.File,
      @Param('courseId') id: string
  ) {
      return this.courseService.uploadShortVideo(id, file);
  }
  


}
