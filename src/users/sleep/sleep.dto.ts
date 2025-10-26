import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsDateString, IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateSleepDto {
  @ApiProperty({ description: 'Sleep time', example: '2025-10-26T22:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  sleepTime: Date;

  @ApiProperty({ description: 'Wake time', example: '2025-10-27T06:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  wakeTime: Date;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Sleep quality rating (1-5)', example: 4, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  quality?: number;

  @ApiProperty({ description: 'Notes about sleep', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSleepDto {
  @ApiProperty({ description: 'Sleep time', required: false })
  @IsOptional()
  @IsDateString()
  sleepTime?: Date;

  @ApiProperty({ description: 'Wake time', required: false })
  @IsOptional()
  @IsDateString()
  wakeTime?: Date;

  @ApiProperty({ description: 'Sleep quality rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  quality?: number;

  @ApiProperty({ description: 'Notes about sleep', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SleepQueryDto {
  @ApiProperty({ description: 'Start date for filtering', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date for filtering', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Limit results', required: false, example: 30 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class SleepGoalDto {
  @ApiProperty({ description: 'Target sleep hours per night', example: 8 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(24)
  targetHours: number;

  @ApiProperty({ description: 'Target bedtime', example: '22:00' })
  @IsOptional()
  @IsString()
  targetBedtime?: string;

  @ApiProperty({ description: 'Target wake time', example: '06:00' })
  @IsOptional()
  @IsString()
  targetWakeTime?: string;
}

export class SleepAnalyticsDto {
  totalRecords: number;
  averageSleepHours: number;
  totalSleepHours: number;
  averageQuality?: number;
  bestSleepDuration: number;
  worstSleepDuration: number;
  sleepDebt: number;
  consistencyScore: number;
  weeklyAverage: number;
  monthlyAverage: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

export class SleepResponseDto {
  id: string;
  userId: string;
  sleepTime: Date;
  wakeTime: Date;
  duration: number; // in hours
  quality?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
