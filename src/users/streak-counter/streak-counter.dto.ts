import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, IsDateString, IsBoolean } from 'class-validator';

// ============================================================================
// REQUEST DTOs
// ============================================================================

export class IncrementStreakDto {
  @ApiProperty({
    description: 'User ID (optional if authenticated)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Activity type that triggered the streak increment',
    example: 'exercise_completed',
    required: false,
  })
  @IsOptional()
  @IsString()
  activityType?: string;
}

export class UpdateStreakDto {
  @ApiProperty({
    description: 'New streak count',
    example: 7,
  })
  @IsInt()
  @Min(0)
  streak: number;

  @ApiProperty({
    description: 'Last activity date',
    example: '2024-10-26',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  lastDate?: string;
}

export class StreakQueryDto {
  @ApiProperty({
    description: 'Start date for filtering',
    example: '2024-10-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering',
    example: '2024-10-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Minimum streak count',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStreak?: number;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

export class StreakResponseDto {
  @ApiProperty({
    description: 'Streak counter ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Current streak count (consecutive days)',
    example: 15,
  })
  streak: number;

  @ApiProperty({
    description: 'Last activity date',
    example: '2024-10-26T10:30:00.000Z',
  })
  lastDate: Date;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-10-01T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-10-26T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class StreakStatsDto {
  @ApiProperty({
    description: 'Current active streak',
    example: 15,
  })
  currentStreak: number;

  @ApiProperty({
    description: 'Longest streak ever achieved',
    example: 30,
  })
  longestStreak: number;

  @ApiProperty({
    description: 'Total days active',
    example: 45,
  })
  totalDaysActive: number;

  @ApiProperty({
    description: 'Last activity date',
    example: '2024-10-26',
  })
  lastActivityDate: string;

  @ApiProperty({
    description: 'Is streak active today',
    example: true,
  })
  isActiveToday: boolean;

  @ApiProperty({
    description: 'Days until streak is lost (0 or 1)',
    example: 1,
  })
  daysUntilLoss: number;

  @ApiProperty({
    description: 'Streak milestone (next goal)',
    example: 20,
  })
  nextMilestone: number;

  @ApiProperty({
    description: 'Progress to next milestone (percentage)',
    example: 75,
  })
  milestoneProgress: number;
}

export class StreakHistoryDto {
  @ApiProperty({
    description: 'Date of the streak record',
    example: '2024-10-26',
  })
  date: string;

  @ApiProperty({
    description: 'Streak count on that date',
    example: 15,
  })
  streak: number;

  @ApiProperty({
    description: 'Was active on this day',
    example: true,
  })
  wasActive: boolean;
}

export class MonthlyStreakSummaryDto {
  @ApiProperty({
    description: 'Month (YYYY-MM)',
    example: '2024-10',
  })
  month: string;

  @ApiProperty({
    description: 'Total active days in month',
    example: 22,
  })
  activeDays: number;

  @ApiProperty({
    description: 'Total days in month',
    example: 31,
  })
  totalDays: number;

  @ApiProperty({
    description: 'Activity rate percentage',
    example: 70.97,
  })
  activityRate: number;

  @ApiProperty({
    description: 'Highest streak in month',
    example: 15,
  })
  highestStreak: number;

  @ApiProperty({
    description: 'Current month streak',
    example: 10,
  })
  currentStreak: number;

  @ApiProperty({
    description: 'Calendar view (day -> streak)',
    example: { '1': 1, '2': 2, '3': 3 },
  })
  calendar: Record<string, number>;
}

export class LeaderboardEntryDto {
  @ApiProperty({
    description: 'Rank position',
    example: 1,
  })
  rank: number;

  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  userName: string;

  @ApiProperty({
    description: 'User profile image',
    example: 'https://example.com/image.jpg',
  })
  userImage: string;

  @ApiProperty({
    description: 'Current streak count',
    example: 30,
  })
  currentStreak: number;

  @ApiProperty({
    description: 'Last activity date',
    example: '2024-10-26',
  })
  lastActivityDate: string;

  @ApiProperty({
    description: 'Is streak active (within last 24h)',
    example: true,
  })
  isActive: boolean;
}

export class StreakMilestoneDto {
  @ApiProperty({
    description: 'Milestone achieved',
    example: 7,
  })
  milestone: number;

  @ApiProperty({
    description: 'Milestone description',
    example: '7 Day Streak - One Week Warrior!',
  })
  description: string;

  @ApiProperty({
    description: 'Reward/badge earned',
    example: '🔥 Week Warrior Badge',
  })
  reward: string;

  @ApiProperty({
    description: 'Achievement date',
    example: '2024-10-26T10:30:00.000Z',
  })
  achievedAt: Date;
}

export class StreakResetResponseDto {
  @ApiProperty({
    description: 'Previous streak count',
    example: 15,
  })
  previousStreak: number;

  @ApiProperty({
    description: 'New streak count',
    example: 0,
  })
  newStreak: number;

  @ApiProperty({
    description: 'Reset reason',
    example: 'Manual reset by user',
  })
  reason: string;

  @ApiProperty({
    description: 'Reset timestamp',
    example: '2024-10-26T10:30:00.000Z',
  })
  resetAt: Date;
}

export class StreakIncrementResponseDto {
  @ApiProperty({
    description: 'Previous streak count',
    example: 14,
  })
  previousStreak: number;

  @ApiProperty({
    description: 'New streak count',
    example: 15,
  })
  newStreak: number;

  @ApiProperty({
    description: 'Was already active today',
    example: false,
  })
  wasAlreadyActive: boolean;

  @ApiProperty({
    description: 'Milestone achieved (if any)',
    required: false,
  })
  milestone?: StreakMilestoneDto;

  @ApiProperty({
    description: 'Encouragement message',
    example: "Great job! You're on a 15-day streak! 🔥",
  })
  message: string;
}
