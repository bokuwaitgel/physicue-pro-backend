import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { ChallengeType, ChallengeTier } from '@prisma/client';

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @IsNotEmpty()
  duration: number; // in days

  @IsInt()
  @IsNotEmpty()
  point: number;

  @IsArray()
  @IsEnum(ChallengeType, { each: true })
  type: ChallengeType[];

  @IsString({ each: true })
  @IsEnum(ChallengeTier, { each: true })
  tier: ChallengeTier[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsNotEmpty()
  goal: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  instructions?: string[];
}

export class UpdateChallengeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsInt()
  @IsOptional()
  point?: number;

  @IsArray()
  @IsEnum(ChallengeType, { each: true })
  @IsOptional()
  type?: ChallengeType[];

  @IsString({ each: true })
  @IsEnum(ChallengeTier, { each: true })
  @IsOptional()
  tier?: ChallengeTier[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  goal?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  instructions?: string[];
}

export class EnrollChallengeDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;
}

export class UpdateProgressDto {
  @IsString()
  @IsNotEmpty()
  enrollmentId: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class ChallengeResponseDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: number;
  point: number;
  type: ChallengeType[];
  status: string;
  goal: string;
  createdAt: Date;
  updatedAt: Date;
  instructions?: {
    id: string;
    instruction: string;
  }[];
  enrollmentCount?: number;
  isEnrolled?: boolean;
}

export class EnrollmentResponseDto {
  id: string;
  challengeId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  challenge?: ChallengeResponseDto;
  totalPoints?: number;
}

export class LeaderboardDto {
  userId: string;
  userName: string;
  userImage: string;
  totalPoints: number;
  challengesCompleted: number;
  rank: number;
}
