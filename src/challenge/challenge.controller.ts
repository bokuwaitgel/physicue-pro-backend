import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  EnrollChallengeDto,
  UpdateProgressDto,
  ChallengeResponseDto,
  EnrollmentResponseDto,
  LeaderboardDto,
} from './challenge.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller handling challenge-related operations including challenge management,
 * user enrollment, progress tracking, and leaderboard functionality.
 * 
 * @remarks
 * This controller provides endpoints for:
 * - Creating, reading, updating, and deleting challenges (admin/public)
 * - User enrollment in challenges
 * - Progress tracking and updates
 * - Leaderboard and user statistics
 * 
 * @see {@link ChallengeService} for business logic implementation
 * @see {@link JwtAuthGuard} for authentication requirements
 */
@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get('types')
  async getChallengeTypes(): Promise<any> {
    return this.challengeService.getChallengeTypes();
  }

  // ============================================================================
  // CHALLENGE MANAGEMENT (Admin/Public)
  // ============================================================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createChallenge(
    @Body() createChallengeDto: CreateChallengeDto,
  ): Promise<{ success: boolean; data: ChallengeResponseDto }> {
    const challenge = await this.challengeService.createChallenge(createChallengeDto);
    return challenge;
  }

  @Get()
  async getAllChallenges(
    @Query('userId') userId?: string,
  ): Promise<{ success: boolean; data: ChallengeResponseDto[] }> {
    const challenges = await this.challengeService.getAllChallenges(userId);
    return challenges;
  }

  @Get(':id')
  async getChallengeById(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ): Promise<{ success: boolean; data: ChallengeResponseDto }> {
    const challenge = await this.challengeService.getChallengeById(id, userId);
    return challenge
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  async updateChallenge(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
  ): Promise<{ success: boolean; data: ChallengeResponseDto }> {
    const challenge = await this.challengeService.updateChallenge(id, updateChallengeDto);
    return challenge
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteChallenge(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.challengeService.deleteChallenge(id);
    return result;
  }

  // ============================================================================
  // USER ENROLLMENT
  // ============================================================================

  @Post('enroll')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async enrollInChallenge(
    @Request() req,
    @Body() enrollChallengeDto: EnrollChallengeDto,
  ): Promise<any> {
    const userId = req.user.userId || req.user.id;
    const enrollment = await this.challengeService.enrollInChallenge(userId, enrollChallengeDto);
    return enrollment;
  }

  @Get('user/enrollments')
  @UseGuards(JwtAuthGuard)
  async getUserEnrollments(
    @Request() req,
  ): Promise<{ success: boolean; data: EnrollmentResponseDto[] }> {
    const userId = req.user.userId || req.user.id;
    const enrollments = await this.challengeService.getUserEnrollments(userId);
    return enrollments;
  }

  @Put('progress')
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @Request() req,
    @Body() updateProgressDto: UpdateProgressDto,
  ): Promise<any> {
    const userId = req.user.userId || req.user.id;
    const enrollment = await this.challengeService.updateChallengeProgress(userId, updateProgressDto);
    return enrollment;
  }

  @Delete('enrollment/:enrollmentId')
  @UseGuards(JwtAuthGuard)
  async cancelEnrollment(
    @Request() req,
    @Param('enrollmentId') enrollmentId: string,
  ): Promise<any> {
    const userId = req.user.userId || req.user.id;
    const result = await this.challengeService.cancelEnrollment(userId, enrollmentId);
    return result;
  }

  // ============================================================================
  // LEADERBOARD & STATISTICS
  // ============================================================================

  @Get('leaderboard/top')
  async getLeaderboard(
    @Query('limit') limit?: string,
  ): Promise<{ success: boolean; data: LeaderboardDto[] }> {
    const leaderboard = await this.challengeService.getLeaderboard(
      limit ? parseInt(limit, 10) : 10,
    );
    return leaderboard;
  }

  @Get('user/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(
    @Request() req,
  ): Promise<any> {
    const userId = req.user.userId || req.user.id;
    const stats = await this.challengeService.getUserStats(userId);
    return stats;   
  }
}
