import { Body, Controller, Delete, Get, Post, Put, Param, Query, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { SleepService } from './sleep.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthService } from '../../auth/auth.service';

//dtos
import { 
  CreateSleepDto,
  UpdateSleepDto,
  SleepQueryDto,
} from './sleep.dto';

@ApiTags('sleep')
@Controller('sleep')
export class SleepController {
  constructor(
    private readonly sleepService: SleepService,
    private readonly authService: AuthService
  ) {}

  // ============================================================================
  // SLEEP TRACKING
  // ============================================================================

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create sleep record' })
  @ApiResponse({ status: 201, description: 'Sleep record created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async createSleep(@Body() data: CreateSleepDto, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.sleepService.create(data, decoded.data.id);
  }

  @Put(':sleepId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sleep record' })
  @ApiResponse({ status: 200, description: 'Sleep record updated successfully' })
  @ApiResponse({ status: 404, description: 'Sleep record not found' })
  public async updateSleep(
    @Param('sleepId') sleepId: string,
    @Body() data: UpdateSleepDto,
    @Headers('Authorization') auth: string
  ) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.sleepService.update(sleepId, data, decoded.data.id);
  }

  @Delete(':sleepId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete sleep record' })
  @ApiResponse({ status: 200, description: 'Sleep record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sleep record not found' })
  public async deleteSleep(
    @Param('sleepId') sleepId: string,
    @Headers('Authorization') auth: string
  ) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.sleepService.delete(sleepId, decoded.data.id);
  }

  // ============================================================================
  // RETRIEVAL
  // ============================================================================

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sleep history for authenticated user' })
  @ApiResponse({ status: 200, description: 'Sleep history retrieved successfully' })
  public async getSleepHistory(@Headers('Authorization') auth: string, @Query() query: SleepQueryDto) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.sleepService.getSleepTimes(decoded.data.id, query);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get sleep history by user ID' })
  @ApiResponse({ status: 200, description: 'Sleep history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async getSleepByUserId(
    @Param('userId') userId: string,
    @Query() query: SleepQueryDto
  ) {
    return this.sleepService.getSleepTimes(userId, query);
  }

  @Get('record/:sleepId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single sleep record' })
  @ApiResponse({ status: 200, description: 'Sleep record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Sleep record not found' })
  public async getSleepById(
    @Param('sleepId') sleepId: string,
    @Headers('Authorization') auth: string
  ) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.sleepService.getSleepById(sleepId, decoded.data.id);
  }

  // ============================================================================
  // ANALYTICS & REPORTS
  // ============================================================================

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive sleep analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  public async getAnalytics(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.sleepService.getAnalytics(decoded.data.id);
  }

  @Get('weekly-summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly sleep summary' })
  @ApiResponse({ status: 200, description: 'Weekly summary retrieved successfully' })
  public async getWeeklySummary(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.sleepService.getWeeklySummary(decoded.data.id);
  }

  @Get('monthly-summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get monthly sleep summary' })
  @ApiResponse({ status: 200, description: 'Monthly summary retrieved successfully' })
  public async getMonthlySummary(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.sleepService.getMonthlySummary(decoded.data.id);
  }

  // ============================================================================
  // LEGACY ENDPOINTS (Backward Compatibility)
  // ============================================================================

  @Post('createSleep')
  @ApiOperation({ summary: 'Create sleep (Legacy endpoint)' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async createSleepLegacy(@Body() data: CreateSleepDto) {
    return this.sleepService.create(data);
  }

  @Get('getSleep/:userId')
  @ApiOperation({ summary: 'Get sleep (Legacy endpoint)' })
  @ApiResponse({ status: 200, description: 'Data' })
  public async getSleepLegacy(@Param('userId') userId: string) {
    return this.sleepService.getSleepTimes(userId);
  }
}
