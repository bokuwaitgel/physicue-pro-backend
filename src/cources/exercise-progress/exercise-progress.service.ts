import { Injectable, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CompleteExerciseDto,
  UpdateExerciseProgressDto,
  ExerciseProgressQueryDto,
  ExerciseProgressResponseDto,
  ExerciseStatsDto,
  DailyExerciseSummaryDto,
  WeeklyExerciseSummaryDto,
  LeaderboardEntryDto,
  CalorieRewardResponseDto,
} from './exercise-progress.dto';

@Injectable()
export class ExerciseProgressService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // EXERCISE COMPLETION & PROGRESS TRACKING
  // ============================================================================

  async completeExercise(completeExerciseDto: CompleteExerciseDto, authenticatedUserId?: string) {
    const userId = completeExerciseDto.userId || authenticatedUserId;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify exercise exists
    const exercise = await this.prisma.exercises.findUnique({
      where: { id: completeExerciseDto.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Calculate calories burned based on duration and intensity
    const durationMinutes = completeExerciseDto.durationMinutes || exercise.duration;
    const intensity = completeExerciseDto.intensity || 5;
    const baseCalories = exercise.calories || 0;
    
    // Adjust calories based on actual duration vs planned duration
    const durationMultiplier = durationMinutes / exercise.duration;
    // Intensity multiplier: 1 = 0.7x, 5 = 1.0x, 10 = 1.5x
    const intensityMultiplier = 0.7 + (intensity - 1) * 0.089;
    
    const caloriesBurned = Math.round(baseCalories * durationMultiplier * intensityMultiplier);
    const expEarned = caloriesBurned; // 1 calorie = 1 EXP

    const completedAt = completeExerciseDto.completedAt ? new Date(completeExerciseDto.completedAt) : new Date();

    // Create progress record
    const progress = await this.prisma.userExerciseProgress.create({
      data: {
        userId,
        exerciseId: completeExerciseDto.exerciseId,
        isCompleted: true,
        createdAt: completedAt,
      },
    });

    // Award calories (EXP) to user
    const calorieReward = await this.awardCaloriesToUser(
      userId,
      expEarned,
      exercise.name,
      caloriesBurned
    );

    return {
      status: true,
      type: 'success',
      message: `Exercise completed! You earned ${expEarned} EXP and burned ${caloriesBurned} calories!`,
      code: HttpStatus.CREATED,
      data: {
        progress: {
          ...progress,
          durationMinutes,
          intensity,
          notes: completeExerciseDto.notes,
          caloriesBurned,
          expEarned,
        },
        exercise: {
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          duration: exercise.duration,
          calories: exercise.calories,
          level: exercise.level,
          type: exercise.type,
          image: exercise.image,
        },
        reward: calorieReward,
      },
    };
  }

  async getUserProgress(userId: string, query?: ExerciseProgressQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const where: any = { userId };

    if (query?.isCompleted !== undefined) {
      where.isCompleted = query.isCompleted;
    }

    if (query?.startDate || query?.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const progressRecords = await this.prisma.userExerciseProgress.findMany({
      where,
      include: {
        exercise: true,
      },
      orderBy: { createdAt: 'desc' },
      take: query?.limit || 50,
    });

    const formattedRecords = progressRecords.map((record) => ({
      id: record.id,
      userId: record.userId,
      exerciseId: record.exerciseId,
      isCompleted: record.isCompleted,
      caloriesBurned: record.exercise.calories || 0,
      expEarned: record.exercise.calories || 0,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      exercise: {
        id: record.exercise.id,
        name: record.exercise.name,
        description: record.exercise.description,
        duration: record.exercise.duration,
        calories: record.exercise.calories,
        level: record.exercise.level,
        type: record.exercise.type,
        image: record.exercise.image,
      },
    }));

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        totalRecords: progressRecords.length,
        progress: formattedRecords,
      },
    };
  }

  async getProgressById(progressId: string, userId: string) {
    const progress = await this.prisma.userExerciseProgress.findUnique({
      where: { id: progressId },
      include: {
        exercise: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    if (progress.userId !== userId) {
      throw new BadRequestException('You can only view your own progress');
    }

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        ...progress,
        caloriesBurned: progress.exercise.calories || 0,
        expEarned: progress.exercise.calories || 0,
      },
    };
  }

  async updateProgress(progressId: string, userId: string, updateDto: UpdateExerciseProgressDto) {
    const progress = await this.prisma.userExerciseProgress.findUnique({
      where: { id: progressId },
    });

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    if (progress.userId !== userId) {
      throw new BadRequestException('You can only update your own progress');
    }

    const updated = await this.prisma.userExerciseProgress.update({
      where: { id: progressId },
      data: {
        isCompleted: updateDto.isCompleted,
      },
      include: {
        exercise: true,
      },
    });

    return {
      status: true,
      type: 'success',
      message: 'Progress updated successfully',
      code: HttpStatus.OK,
      data: updated,
    };
  }

  async deleteProgress(progressId: string, userId: string) {
    const progress = await this.prisma.userExerciseProgress.findUnique({
      where: { id: progressId },
    });

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    if (progress.userId !== userId) {
      throw new BadRequestException('You can only delete your own progress');
    }

    await this.prisma.userExerciseProgress.delete({
      where: { id: progressId },
    });

    return {
      status: true,
      type: 'success',
      message: 'Progress record deleted successfully',
      code: HttpStatus.OK,
    };
  }

  // ============================================================================
  // STATISTICS & ANALYTICS
  // ============================================================================

  async getUserStats(userId: string): Promise<ExerciseStatsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allProgress = await this.prisma.userExerciseProgress.findMany({
      where: { userId, isCompleted: true },
      include: {
        exercise: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalExercisesCompleted = allProgress.length;
    const totalCaloriesBurned = allProgress.reduce((sum, p) => sum + (p.exercise.calories || 0), 0);
    const totalExpEarned = totalCaloriesBurned; // 1:1 ratio
    const totalDurationMinutes = allProgress.reduce((sum, p) => sum + (p.exercise.duration || 0), 0);

    // Calculate streak
    const streakDays = await this.calculateStreak(userId);

    // Find favorite exercise type
    const typeCount = {};
    allProgress.forEach((p) => {
      const type = p.exercise.type || 'Other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    const favoriteExerciseType = Object.keys(typeCount).reduce(
      (a, b) => (typeCount[a] > typeCount[b] ? a : b),
      'None'
    );

    // Get total available exercises for completion rate
    const totalAvailableExercises = await this.prisma.exercises.count({
      where: { status: 'active' },
    });
    const uniqueExercisesCompleted = new Set(allProgress.map((p) => p.exerciseId)).size;
    const completionRate = totalAvailableExercises > 0
      ? (uniqueExercisesCompleted / totalAvailableExercises) * 100
      : 0;

    // Recent completions
    const recentCompletions = allProgress.slice(0, 10).map((p) => ({
      id: p.id,
      userId: p.userId,
      exerciseId: p.exerciseId,
      isCompleted: p.isCompleted,
      caloriesBurned: p.exercise.calories || 0,
      expEarned: p.exercise.calories || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      exercise: {
        id: p.exercise.id,
        name: p.exercise.name,
        description: p.exercise.description,
        duration: p.exercise.duration,
        calories: p.exercise.calories,
        level: p.exercise.level,
        type: p.exercise.type,
        image: p.exercise.image,
      },
    }));

    return {
      totalExercisesCompleted,
      totalCaloriesBurned,
      totalExpEarned,
      totalDurationMinutes,
      averageIntensity: 0, // Would need to store intensity in DB
      streakDays,
      favoriteExerciseType,
      completionRate: parseFloat(completionRate.toFixed(2)),
      recentCompletions,
    };
  }

  async getDailySummary(userId: string, date?: string): Promise<DailyExerciseSummaryDto> {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const progress = await this.prisma.userExerciseProgress.findMany({
      where: {
        userId,
        isCompleted: true,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        exercise: true,
      },
    });

    const exercisesCompleted = progress.length;
    const totalCaloriesBurned = progress.reduce((sum, p) => sum + (p.exercise.calories || 0), 0);
    const totalExpEarned = totalCaloriesBurned;
    const totalDurationMinutes = progress.reduce((sum, p) => sum + (p.exercise.duration || 0), 0);

    return {
      date: startOfDay.toISOString().split('T')[0],
      exercisesCompleted,
      totalCaloriesBurned,
      totalExpEarned,
      totalDurationMinutes,
      exercises: progress.map((p) => ({
        id: p.id,
        userId: p.userId,
        exerciseId: p.exerciseId,
        isCompleted: p.isCompleted,
        caloriesBurned: p.exercise.calories || 0,
        expEarned: p.exercise.calories || 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        exercise: {
          id: p.exercise.id,
          name: p.exercise.name,
          description: p.exercise.description,
          duration: p.exercise.duration,
          calories: p.exercise.calories,
          level: p.exercise.level,
          type: p.exercise.type,
          image: p.exercise.image,
        },
      })),
    };
  }

  async getWeeklySummary(userId: string): Promise<WeeklyExerciseSummaryDto> {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const progress = await this.prisma.userExerciseProgress.findMany({
      where: {
        userId,
        isCompleted: true,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        exercise: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalExercisesCompleted = progress.length;
    const totalCaloriesBurned = progress.reduce((sum, p) => sum + (p.exercise.calories || 0), 0);
    const totalExpEarned = totalCaloriesBurned;
    const totalDurationMinutes = progress.reduce((sum, p) => sum + (p.exercise.duration || 0), 0);

    // Group by day
    const dailyMap = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyMap[dateKey] = {
        date: dateKey,
        exercisesCompleted: 0,
        totalCaloriesBurned: 0,
        totalExpEarned: 0,
        totalDurationMinutes: 0,
        exercises: [],
      };
    }

    progress.forEach((p) => {
      const dateKey = new Date(p.createdAt).toISOString().split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].exercisesCompleted++;
        dailyMap[dateKey].totalCaloriesBurned += p.exercise.calories || 0;
        dailyMap[dateKey].totalExpEarned += p.exercise.calories || 0;
        dailyMap[dateKey].totalDurationMinutes += p.exercise.duration || 0;
        dailyMap[dateKey].exercises.push({
          id: p.id,
          userId: p.userId,
          exerciseId: p.exerciseId,
          isCompleted: p.isCompleted,
          caloriesBurned: p.exercise.calories || 0,
          expEarned: p.exercise.calories || 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          exercise: {
            id: p.exercise.id,
            name: p.exercise.name,
            description: p.exercise.description,
            duration: p.exercise.duration,
            calories: p.exercise.calories,
            level: p.exercise.level,
            type: p.exercise.type,
            image: p.exercise.image,
          },
        });
      }
    });

    const dailyBreakdown = Object.values(dailyMap).reverse() as DailyExerciseSummaryDto[];
    
    // Find most active day
    const mostActiveDay = dailyBreakdown.reduce(
      (max, day) => (day.exercisesCompleted > max.exercisesCompleted ? day : max),
      dailyBreakdown[0]
    );

    return {
      weekStartDate: sevenDaysAgo.toISOString().split('T')[0],
      weekEndDate: today.toISOString().split('T')[0],
      totalExercisesCompleted,
      totalCaloriesBurned,
      totalExpEarned,
      totalDurationMinutes,
      dailyBreakdown,
      mostActiveDay: mostActiveDay.date,
      averageCaloriesPerDay: parseFloat((totalCaloriesBurned / 7).toFixed(2)),
    };
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntryDto[]> {
    // Get all users with their progress
    const users = await this.prisma.user.findMany({
      include: {
        UserExerciseProgress: {
          where: { isCompleted: true },
          include: {
            exercise: true,
          },
        },
        UserCalories: true,
      },
    });

    const leaderboardData = users
      .map((user) => {
        const totalExpEarned = user.UserExerciseProgress.reduce(
          (sum, p) => sum + (p.exercise.calories || 0),
          0
        );
        const totalExercisesCompleted = user.UserExerciseProgress.length;
        const totalCaloriesBurned = user.UserExerciseProgress.reduce(
          (sum, p) => sum + (p.exercise.calories || 0),
          0
        );

        return {
          userId: user.id,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
          userImage: user.profileImage || '',
          totalExpEarned,
          totalExercisesCompleted,
          totalCaloriesBurned,
          rank: 0,
        };
      })
      .filter((entry) => entry.totalExpEarned > 0)
      .sort((a, b) => b.totalExpEarned - a.totalExpEarned)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return leaderboardData;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async awardCaloriesToUser(
    userId: string,
    expAmount: number,
    exerciseName: string,
    caloriesBurned: number
  ): Promise<CalorieRewardResponseDto> {
    // Get current user calories
    const currentCalories = await this.prisma.userCalories.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const previousCalories = currentCalories?.calories || 0;
    const newTotalCalories = previousCalories + expAmount;

    // Create new calorie record
    await this.prisma.userCalories.create({
      data: {
        userId,
        calories: newTotalCalories,
      },
    });

    return {
      userId,
      previousCalories,
      caloriesEarned: expAmount,
      newTotalCalories,
      source: `Exercise: ${exerciseName}`,
      exerciseName,
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const progressRecords = await this.prisma.userExerciseProgress.findMany({
      where: { userId, isCompleted: true },
      orderBy: { createdAt: 'desc' },
    });

    if (progressRecords.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if there's activity today or yesterday
    const latestActivity = new Date(progressRecords[0].createdAt);
    latestActivity.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - latestActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0; // Streak broken

    // Count consecutive days
    const uniqueDays = new Set(
      progressRecords.map((p) => new Date(p.createdAt).toISOString().split('T')[0])
    );

    const sortedDays = Array.from(uniqueDays).sort().reverse();
    streak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
