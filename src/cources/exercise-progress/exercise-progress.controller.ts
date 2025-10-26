import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExerciseProgressService } from './exercise-progress.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  CompleteExerciseDto,
  UpdateExerciseProgressDto,
  ExerciseProgressQueryDto,
  ExerciseProgressResponseDto,
  ExerciseStatsDto,
  DailyExerciseSummaryDto,
  WeeklyExerciseSummaryDto,
  LeaderboardEntryDto,
} from './exercise-progress.dto';

@ApiTags('Exercise Progress')
@Controller('exercise-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExerciseProgressController {
  constructor(private readonly exerciseProgressService: ExerciseProgressService) {}

  // ============================================================================
  // EXERCISE COMPLETION & TRACKING
  // ============================================================================

  @Post('complete')
  @ApiOperation({ summary: 'Complete an exercise and earn EXP' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Exercise completed successfully and EXP awarded',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User or exercise not found' })
  async completeExercise(@Body() completeExerciseDto: CompleteExerciseDto, @Request() req) {
    return this.exerciseProgressService.completeExercise(completeExerciseDto, req.user.userId);
  }

  @Get('my-progress')
  @ApiOperation({ summary: 'Get authenticated user exercise progress' })
  @ApiQuery({ name: 'isCompleted', required: false, type: Boolean })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User exercise progress retrieved successfully',
  })
  async getMyProgress(@Request() req, @Query() query: ExerciseProgressQueryDto) {
    return this.exerciseProgressService.getUserProgress(req.user.userId, query);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get specific user exercise progress (admin)' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiQuery({ name: 'isCompleted', required: false, type: Boolean })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User exercise progress retrieved successfully',
  })
  async getUserProgress(@Param('userId') userId: string, @Query() query: ExerciseProgressQueryDto) {
    return this.exerciseProgressService.getUserProgress(userId, query);
  }

  @Get(':progressId')
  @ApiOperation({ summary: 'Get specific progress record by ID' })
  @ApiParam({ name: 'progressId', description: 'Progress record ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Progress record retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Progress record not found' })
  async getProgressById(@Param('progressId') progressId: string, @Request() req) {
    return this.exerciseProgressService.getProgressById(progressId, req.user.userId);
  }

  @Patch(':progressId')
  @ApiOperation({ summary: 'Update progress record' })
  @ApiParam({ name: 'progressId', description: 'Progress record ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Progress updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Progress record not found' })
  async updateProgress(
    @Param('progressId') progressId: string,
    @Request() req,
    @Body() updateDto: UpdateExerciseProgressDto
  ) {
    return this.exerciseProgressService.updateProgress(progressId, req.user.userId, updateDto);
  }

  @Delete(':progressId')
  @ApiOperation({ summary: 'Delete progress record' })
  @ApiParam({ name: 'progressId', description: 'Progress record ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Progress record deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Progress record not found' })
  async deleteProgress(@Param('progressId') progressId: string, @Request() req) {
    return this.exerciseProgressService.deleteProgress(progressId, req.user.userId);
  }

  // ============================================================================
  // STATISTICS & ANALYTICS
  // ============================================================================

  @Get('stats/me')
  @ApiOperation({ summary: 'Get authenticated user exercise statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User exercise statistics retrieved successfully',
    type: ExerciseStatsDto,
  })
  async getMyStats(@Request() req) {
    const stats = await this.exerciseProgressService.getUserStats(req.user.userId);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: stats,
    };
  }

  @Get('stats/user/:userId')
  @ApiOperation({ summary: 'Get specific user exercise statistics' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User exercise statistics retrieved successfully',
    type: ExerciseStatsDto,
  })
  async getUserStats(@Param('userId') userId: string) {
    const stats = await this.exerciseProgressService.getUserStats(userId);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: stats,
    };
  }

  @Get('summary/daily')
  @ApiOperation({ summary: 'Get daily exercise summary' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daily summary retrieved successfully',
    type: DailyExerciseSummaryDto,
  })
  async getDailySummary(@Request() req, @Query('date') date?: string) {
    const summary = await this.exerciseProgressService.getDailySummary(req.user.userId, date);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: summary,
    };
  }

  @Get('summary/weekly')
  @ApiOperation({ summary: 'Get weekly exercise summary' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Weekly summary retrieved successfully',
    type: WeeklyExerciseSummaryDto,
  })
  async getWeeklySummary(@Request() req) {
    const summary = await this.exerciseProgressService.getWeeklySummary(req.user.userId);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: summary,
    };
  }

  @Get('leaderboard/top')
  @ApiOperation({ summary: 'Get exercise leaderboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of top users to return' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leaderboard retrieved successfully',
    type: [LeaderboardEntryDto],
  })
  async getLeaderboard(@Query('limit') limit?: number) {
    const leaderboard = await this.exerciseProgressService.getLeaderboard(limit || 10);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: leaderboard,
    };
  }
}
