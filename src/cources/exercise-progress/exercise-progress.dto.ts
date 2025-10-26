import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber, IsDateString, Min } from 'class-validator';

// ============================================================================
// EXERCISE PROGRESS DTOs
// ============================================================================

export class CompleteExerciseDto {
  @ApiProperty({ description: 'Exercise ID', example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  exerciseId: string;

  @ApiProperty({ description: 'User ID (optional, will use authenticated user)', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Duration completed in minutes', example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationMinutes?: number;

  @ApiProperty({ description: 'Intensity level (1-10)', example: 7, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  intensity?: number;

  @ApiProperty({ description: 'Notes about the exercise session', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Date of completion', required: false })
  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}

export class UpdateExerciseProgressDto {
  @ApiProperty({ description: 'Completion status', required: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ description: 'Duration completed in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationMinutes?: number;

  @ApiProperty({ description: 'Intensity level (1-10)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  intensity?: number;

  @ApiProperty({ description: 'Notes about the exercise session', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ExerciseProgressQueryDto {
  @ApiProperty({ description: 'Filter by completion status', required: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ description: 'Start date for filtering', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date for filtering', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Limit results', example: 50, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

export class ExerciseProgressResponseDto {
  id: string;
  userId: string;
  exerciseId: string;
  isCompleted: boolean;
  durationMinutes?: number;
  intensity?: number;
  notes?: string;
  caloriesBurned: number;
  expEarned: number;
  createdAt: Date;
  updatedAt: Date;
  exercise?: {
    id: string;
    name: string;
    description: string;
    duration: number;
    calories: number;
    level: string;
    type: string;
    image: string;
  };
}

export class ExerciseStatsDto {
  totalExercisesCompleted: number;
  totalCaloriesBurned: number;
  totalExpEarned: number;
  totalDurationMinutes: number;
  averageIntensity: number;
  streakDays: number;
  favoriteExerciseType: string;
  completionRate: number;
  recentCompletions: ExerciseProgressResponseDto[];
}

export class DailyExerciseSummaryDto {
  date: string;
  exercisesCompleted: number;
  totalCaloriesBurned: number;
  totalExpEarned: number;
  totalDurationMinutes: number;
  exercises: ExerciseProgressResponseDto[];
}

export class WeeklyExerciseSummaryDto {
  weekStartDate: string;
  weekEndDate: string;
  totalExercisesCompleted: number;
  totalCaloriesBurned: number;
  totalExpEarned: number;
  totalDurationMinutes: number;
  dailyBreakdown: DailyExerciseSummaryDto[];
  mostActiveDay: string;
  averageCaloriesPerDay: number;
}

export class LeaderboardEntryDto {
  userId: string;
  userName: string;
  userImage: string;
  totalExpEarned: number;
  totalExercisesCompleted: number;
  totalCaloriesBurned: number;
  rank: number;
}

export class CalorieRewardResponseDto {
  userId: string;
  previousCalories: number;
  caloriesEarned: number;
  newTotalCalories: number;
  source: string;
  exerciseName: string;
}
