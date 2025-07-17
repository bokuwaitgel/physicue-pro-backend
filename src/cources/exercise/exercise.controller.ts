import { Body, Controller, Get, Post,  Param, Put, Delete, UseInterceptors, UploadedFile, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { ExerciseService } from './exercise.service';

//dtos
import { 
  CreateExerciseDto,
  UpdateExerciseDto,
  deleteExerciseDto,
  addExerciseToCourseDto,
  checkExerciseDto
} from './exercise.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from 'src/auth/auth.service';

@ApiTags('exercise')
@Controller('exercise')
export class ExerciseController {
  constructor
  (private readonly exerciseService: ExerciseService,
    private readonly authService: AuthService
  ) {}


  @Get('getExercises/:teacherId')
  @ApiOperation({ summary: 'Get all exercises' })
  @ApiResponse({ status: 200, description: 'Data' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getExercises(@Param('teacherId') teacherId: string, @Headers('Authorization') auth: string) {
    return this.exerciseService.getExercises(teacherId);
  }

  @Get('getExerciseById/:exerciseid')
  @ApiOperation({ summary: 'Get exercise by id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Data' })
  async getExerciseById(@Param('exerciseid') exerciseid: string, @Headers('Authorization') auth: string) {
    return this.exerciseService.getExerciseById({id: exerciseid});

    
  }

  @Post('createExercise')
    @ApiOperation({ summary: 'Create course' })
    @UseInterceptors(FileInterceptor('shortVideo'))
    @ApiResponse({ status: 200, description: 'Data' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    public async createCourse( 
      @Body() data: CreateExerciseDto,
      @UploadedFile() file: Express.Multer.File,
      @Headers('Authorization') auth: string, ) {

      const decoded = await this.authService.verifyToken({token: auth});
      if (decoded.code != 200) {
          return decoded;
      }
      const userId = decoded.data.id;

      return this.exerciseService.createExercise(data, file, userId);
    }

  @Post('checkExercise')
  @ApiOperation({ summary: 'Check exercise' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Data' })
  public async checkExercise(data: checkExerciseDto, @Headers('Authorization') auth: string, @Param('exerciseId') exerciseId: string) {
    const decoded = await this.authService.verifyToken({token: auth});
      if (decoded.code != 200) {
          return decoded;
      }
      const userId = decoded.data.id;

      console.log('checkExercise', data, userId);

    return this.exerciseService.checkExercise(data.exerciseId, data.courseId, userId);
  }


  // @Post('createExercise')
  // @ApiOperation({ summary: 'Create exercise' })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @ApiResponse({ status: 200, description: 'Data' })
  // public async createExercise(@Body() data: CreateExerciseDto, @Headers('Authorization') auth: string) {

  //   return this.exerciseService.createExercise(data);
  // }

  @Put('updateExercise/:exerciseId')
  @ApiOperation({ summary: 'Update exercise' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Data' })
  public async updateExercise(@Param('exerciseId') exerciseId: string, @Body() data: UpdateExerciseDto, @Headers('Authorization') auth: string) {
    
    return this.exerciseService.updateExercise(exerciseId, data);
  }

  @Delete('deleteExercise')
  @ApiOperation({ summary: 'Delete exercise' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async deleteExercise( @Body() data: deleteExerciseDto) {
    return this.exerciseService.deleteExercise(data);
  }

  @Post('addExerciseToCourse')
  @ApiOperation({ summary: 'Add todo to exercise' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Data' })
  public async addExerciseToCourse(@Body() data: addExerciseToCourseDto, @Headers('Authorization') auth: string) {
   
    return this.exerciseService.addExerciseToCourse(data);
  }

  @Get('getPopularExercises')
  @ApiOperation({ summary: 'Get popular exercises' })
  @ApiResponse({ status: 200, description: 'Data' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPopularExercises(@Headers('Authorization') auth: string) {
    
    return this.exerciseService.getPopularExercises();
  }

  @Post('uploadExerciseImage/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Headers('Authorization') auth: string
  ) {
    
    return this.exerciseService.uploadExerciseImage(id, file);
  }

  @Post('uploadExerciseVideo/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadExerciseVideo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Headers('Authorization') auth: string
  ) {
    return this.exerciseService.uploadExerciseVideo(id, file);
  }

}
