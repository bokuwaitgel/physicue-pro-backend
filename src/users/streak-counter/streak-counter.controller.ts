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
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StreakCounterService } from './streak-counter.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  IncrementStreakDto,
  UpdateStreakDto,
  StreakQueryDto,
  StreakResponseDto,
  StreakStatsDto,
  MonthlyStreakSummaryDto,
  LeaderboardEntryDto,
  StreakResetResponseDto,
  StreakIncrementResponseDto,
} from './streak-counter.dto';
import { AuthService } from 'src/auth/auth.service';

@ApiTags('Streak Counter')
@Controller('streak-counter')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StreakCounterController {
  constructor(
    private readonly streakCounterService: StreakCounterService,
     private readonly authService: AuthService
    ) {}

  // ============================================================================
  // STREAK MANAGEMENT
  // ============================================================================

  @Post('increment')
  @ApiOperation({ summary: 'Increment user streak counter (daily check-in)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Streak incremented successfully',
    type: StreakIncrementResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async incrementStreak(@Body() incrementDto: IncrementStreakDto, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    console.log(decoded);
    return this.streakCounterService.incrementStreak(incrementDto, decoded.data.id);
  }

  @Get('my-streak')
  @ApiOperation({ summary: 'Get authenticated user current streak' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User streak retrieved successfully',
    type: StreakResponseDto,
  })
  async getMyStreak(
    @Headers('Authorization') auth: string,
  ) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.streakCounterService.getStreakByUserId(decoded.data.id);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get specific user streak by ID' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User streak retrieved successfully',
    type: StreakResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getUserStreak(
    @Headers("Authorization") auth: string,
  ) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.streakCounterService.getStreakByUserId(decoded.data.id);
  }

  @Patch('my-streak')
  @ApiOperation({ summary: 'Update authenticated user streak (admin/manual override)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Streak updated successfully',
  })
  async updateMyStreak(@Headers("Authorization") auth: string, @Body() updateDto: UpdateStreakDto) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.streakCounterService.updateStreak(decoded.data.id, updateDto);
  }

  @Patch('user')
  @ApiOperation({ summary: 'Update specific user streak (admin)' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Streak updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async updateUserStreak(@Headers("Authorization") auth: string, @Body() updateDto: UpdateStreakDto) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.streakCounterService.updateStreak(decoded.data.id, updateDto);
  }

  @Delete('my-streak/reset')
  @ApiOperation({ summary: 'Reset authenticated user streak' })
  @ApiQuery({ name: 'reason', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Streak reset successfully',
    type: StreakResetResponseDto,
  })
  async resetMyStreak(@Headers("Authorization") auth: string, @Query('reason') reason?: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.streakCounterService.resetStreak(decoded.userId, reason);
  }

  @Delete('user/del/reset')
  @ApiOperation({ summary: 'Reset specific user streak (admin)' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiQuery({ name: 'reason', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Streak reset successfully',
    type: StreakResetResponseDto,
  })
  async resetUserStreak(@Headers("Authorization") auth: string, @Param('userId') userId: string, @Query('reason') reason?: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.streakCounterService.resetStreak(decoded.data.id, reason);
  }

  // ============================================================================
  // STATISTICS & ANALYTICS
  // ============================================================================

  @Get('stats/me')
  @ApiOperation({ summary: 'Get authenticated user streak statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User streak statistics retrieved successfully',
    type: StreakStatsDto,
  })
  async getMyStats(@Headers("Authorization") auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    const stats = await this.streakCounterService.getStreakStats(decoded.data.id);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: stats,
    };
  }

  @Get('stats/user')
  @ApiOperation({ summary: 'Get specific user streak statistics' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User streak statistics retrieved successfully',
    type: StreakStatsDto,
  })
  async getUserStats(@Headers("Authorization") auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    const stats = await this.streakCounterService.getStreakStats(decoded.data.id);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: stats,
    };
  }

  @Get('summary/monthly')
  @ApiOperation({ summary: 'Get monthly streak summary' })
  @ApiQuery({ 
    name: 'month', 
    required: false, 
    type: String, 
    description: 'Month in YYYY-MM format (defaults to current month)' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Monthly summary retrieved successfully',
    type: MonthlyStreakSummaryDto,
  })
  async getMonthlySummary(@Headers("Authorization") auth: string, @Query('month') month?: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    const summary = await this.streakCounterService.getMonthlySummary(decoded.data.id, month);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: summary,
    };
  }

  @Get('summary/monthly/user')
  @ApiOperation({ summary: 'Get monthly streak summary for specific user' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiQuery({ 
    name: 'month', 
    required: false, 
    type: String, 
    description: 'Month in YYYY-MM format (defaults to current month)' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Monthly summary retrieved successfully',
    type: MonthlyStreakSummaryDto,
  })
  async getUserMonthlySummary(@Headers("Authorization") auth: string, @Query('month') month?: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    const summary = await this.streakCounterService.getMonthlySummary(decoded.data.id, month);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: summary,
    };
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get streak leaderboard' })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of top users to return (default: 10)' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leaderboard retrieved successfully',
    type: [LeaderboardEntryDto],
  })
  async getLeaderboard(@Query('limit') limit?: number) {
    const leaderboard = await this.streakCounterService.getLeaderboard(limit || 10);
    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: leaderboard,
    };
  }
}
