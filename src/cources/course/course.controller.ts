import { Body, Controller, Delete, Get, Post, Put, Param, UseInterceptors, UploadedFile, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { CourseService } from './course.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
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
import { AuthService } from 'src/auth/auth.service';

@ApiTags('course')
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly authService: AuthService
  ) {}

  @Get('getCourses/:teacherId')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getCourses(@Param('teacherId') teacherId: string, @Headers('Authorization') auth: string) {
    
    return this.courseService.getCourses(teacherId);
  }

  @Get('getCourseById/:courseid')
  @ApiOperation({ summary: 'Get course by id' })
  @ApiResponse({ status: 200, description: 'Data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getCourseById(@Param('courseid') courseid: string, @Headers('Authorization') auth: string) { 
    return this.courseService.getCourseById({id: courseid});
  }

  @Post('createCourse/:teacherId')
  @ApiOperation({ summary: 'Create course' })
  @UseInterceptors(FileInterceptor('shortVideo'))
  @ApiResponse({ status: 200, description: 'Data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  public async createCourse( 
    @Body() data: CreateCourseDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('Authorization') auth: string, 
    @Param('teacherId') teacherId: string) {
    return this.courseService.createCourse(data, file, teacherId);
  }

  @Put('updateCourse/:courseId')
  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 200, description: 'Data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  public async updateCourse(@Param('courseId') courseId: string, @Body() data: UpdateCourseDto, @Headers('Authorization') auth: string) {
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCourseDetails(@Param('courseId') courseId: string, @Headers('Authorization') auth: string) {
    const decoded =await this.authService.verifyToken({token: auth});
    if (decoded.code != 200) {
        return decoded;
    }
    const userId = decoded.data.id;
    return this.courseService.getCourseDetails(courseId, userId);
  }


  @Get('getPopularCourses')
  @ApiOperation({ summary: 'Get popular courses' })
  @ApiResponse({ status: 200, description: 'Data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getPopularCourses(@Headers('Authorization') auth: string) {
    const decoded =await this.authService.verifyToken({token: auth});
    if (decoded.code != 200) {
        return decoded;
    }
    const userId = decoded.data.id;
    return this.courseService.getPopularCourses(userId);
  }

  @Post('uploadCourseBanner/:courseId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async uploadProfileImage(
      @UploadedFile() file: Express.Multer.File,
      @Param('courseId') id: string,
      @Headers('Authorization') auth: string
  ) {

      if (!file) {
          return {
              status: false,
              type: 'error',
              code: 400,
              message: 'File not found',
          };
      }
      return await this.courseService.uploadCourseImage(id, file);
  }

  @Post('uploadShortVideo/:courseId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async uploadShortVideo(
      @UploadedFile() file: Express.Multer.File,
      @Param('courseId') id: string,
      @Headers('Authorization') auth: string
  ) {
      if (!file) {
          return {
              status: false,
              type: 'error',
              code: 400,
              message: 'File not found',
          };
      }
      return await this.courseService.uploadShortVideo(id, file);
  }

  @Post('EnrollCourse')
  @ApiOperation({ summary: 'Enroll course' })
  @ApiResponse({ status: 200, description: 'Data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  public async enrollCourse(@Body() data: any, @Headers('Authorization') auth: string) {
    const decoded =await this.authService.verifyToken({token: auth});
    if (decoded.code != 200) {
        return decoded;
    }
    const userId = decoded.data.id;
    return this.courseService.enrollCourse(data.courseId, userId);
  }

  @Get('courseHistory')
  @ApiOperation({ summary: 'Get course history' })
  @ApiResponse({ status: 200, description: 'Data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getCourseHistory(@Headers('Authorization') auth: string) {
    const decoded =await this.authService.verifyToken({token: auth});
    if (decoded.code != 200) {
        return decoded;
    }
    const userId = decoded.data.id;
    return this.courseService.courseHistory(userId);
  }



}
