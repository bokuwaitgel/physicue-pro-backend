import { Injectable, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IncrementStreakDto,
  UpdateStreakDto,
  StreakQueryDto,
  StreakResponseDto,
  StreakStatsDto,
  MonthlyStreakSummaryDto,
  LeaderboardEntryDto,
  StreakMilestoneDto,
  StreakResetResponseDto,
  StreakIncrementResponseDto,
} from './streak-counter.dto';

@Injectable()
export class StreakCounterService {
  constructor(private readonly prisma: PrismaService) {}

  // Milestone thresholds
  private readonly MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

  // ============================================================================
  // STREAK MANAGEMENT
  // ============================================================================

  async incrementStreak(dto: IncrementStreakDto, authenticatedUserId?: string) {
    const userId = dto.userId || authenticatedUserId;

    console.log('Incrementing streak for userId:', userId);

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

    // Get or create streak counter
    let streakCounter = await this.prisma.userStreakCounter.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let previousStreak = 0;
    let newStreak = 0;
    let wasAlreadyActive = false;
    let milestone: StreakMilestoneDto | undefined;

    if (!streakCounter) {
      // Create new streak counter
      streakCounter = await this.prisma.userStreakCounter.create({
        data: {
          userId,
          streak: 1,
          lastDate: now,
        },
      });
      newStreak = 1;
    } else {
      previousStreak = streakCounter.streak;
      const lastDate = new Date(streakCounter.lastDate);
      const lastDateOnly = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

      const daysDifference = Math.floor((today.getTime() - lastDateOnly.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDifference === 0) {
        // Already active today
        wasAlreadyActive = true;
        newStreak = streakCounter.streak;
      } else if (daysDifference === 1) {
        // Consecutive day - increment streak
        newStreak = streakCounter.streak + 1;
        await this.prisma.userStreakCounter.update({
          where: { id: streakCounter.id },
          data: {
            streak: newStreak,
            lastDate: now,
          },
        });

        // Check for milestone
        milestone = this.checkMilestone(previousStreak, newStreak);
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
        await this.prisma.userStreakCounter.update({
          where: { id: streakCounter.id },
          data: {
            streak: 1,
            lastDate: now,
          },
        });
      }
    }

    const message = this.getStreakMessage(newStreak, wasAlreadyActive);

    const response: StreakIncrementResponseDto = {
      previousStreak,
      newStreak,
      wasAlreadyActive,
      message,
      milestone,
    };

    return {
      status: true,
      type: 'success',
      message,
      code: HttpStatus.OK,
      data: response,
    };
  }

  async getStreakByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const streakCounter = await this.prisma.userStreakCounter.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!streakCounter) {
      return {
        status: true,
        type: 'success',
        code: HttpStatus.OK,
        data: {
          id: null,
          userId,
          streak: 0,
          lastDate: null,
          createdAt: null,
          updatedAt: null,
        },
      };
    }

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: streakCounter,
    };
  }

  async updateStreak(userId: string, updateDto: UpdateStreakDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let streakCounter = await this.prisma.userStreakCounter.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const updateData: any = {
      streak: updateDto.streak,
    };

    if (updateDto.lastDate) {
      updateData.lastDate = new Date(updateDto.lastDate);
    }

    if (!streakCounter) {
      // Create new record
      streakCounter = await this.prisma.userStreakCounter.create({
        data: {
          userId,
          ...updateData,
        },
      });
    } else {
      // Update existing record
      streakCounter = await this.prisma.userStreakCounter.update({
        where: { id: streakCounter.id },
        data: updateData,
      });
    }

    return {
      status: true,
      type: 'success',
      message: 'Streak updated successfully',
      code: HttpStatus.OK,
      data: streakCounter,
    };
  }

  async resetStreak(userId: string, reason: string = 'Manual reset') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const streakCounter = await this.prisma.userStreakCounter.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!streakCounter) {
      throw new NotFoundException('No streak record found for this user');
    }

    const previousStreak = streakCounter.streak;

    await this.prisma.userStreakCounter.update({
      where: { id: streakCounter.id },
      data: {
        streak: 0,
        lastDate: new Date(),
      },
    });

    const response: StreakResetResponseDto = {
      previousStreak,
      newStreak: 0,
      reason,
      resetAt: new Date(),
    };

    return {
      status: true,
      type: 'success',
      message: 'Streak reset successfully',
      code: HttpStatus.OK,
      data: response,
    };
  }

  // ============================================================================
  // STATISTICS & ANALYTICS
  // ============================================================================

  async getStreakStats(userId: string): Promise<StreakStatsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allStreaks = await this.prisma.userStreakCounter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (allStreaks.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysActive: 0,
        lastActivityDate: 'Never',
        isActiveToday: false,
        daysUntilLoss: 0,
        nextMilestone: this.MILESTONES[0],
        milestoneProgress: 0,
      };
    }

    const currentStreakRecord = allStreaks[0];
    const currentStreak = currentStreakRecord.streak;
    const longestStreak = Math.max(...allStreaks.map((s) => s.streak));
    const totalDaysActive = allStreaks.reduce((sum, s) => sum + s.streak, 0);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(currentStreakRecord.lastDate);
    const lastDateOnly = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

    const daysDifference = Math.floor((today.getTime() - lastDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    const isActiveToday = daysDifference === 0;
    const daysUntilLoss = daysDifference === 0 ? 1 : 0;

    // Calculate next milestone
    const nextMilestone = this.MILESTONES.find((m) => m > currentStreak) || this.MILESTONES[this.MILESTONES.length - 1];
    const previousMilestone = this.MILESTONES.filter((m) => m <= currentStreak).pop() || 0;
    const milestoneProgress = previousMilestone === nextMilestone
      ? 100
      : Math.round(((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100);

    return {
      currentStreak,
      longestStreak,
      totalDaysActive,
      lastActivityDate: lastDate.toISOString().split('T')[0],
      isActiveToday,
      daysUntilLoss,
      nextMilestone,
      milestoneProgress,
    };
  }

  async getMonthlySummary(userId: string, month?: string): Promise<MonthlyStreakSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Parse target month
    const targetDate = month ? new Date(month) : new Date();
    const year = targetDate.getFullYear();
    const monthNum = targetDate.getMonth();

    const startOfMonth = new Date(year, monthNum, 1);
    const endOfMonth = new Date(year, monthNum + 1, 0);
    const totalDays = endOfMonth.getDate();

    // Get all streak records for the month
    const streaks = await this.prisma.userStreakCounter.findMany({
      where: {
        userId,
        lastDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { lastDate: 'asc' },
    });

    // Build calendar
    const calendar: Record<string, number> = {};
    let activeDays = 0;
    let highestStreak = 0;
    let currentStreak = 0;

    streaks.forEach((streak) => {
      const day = new Date(streak.lastDate).getDate();
      calendar[day.toString()] = streak.streak;
      activeDays++;
      if (streak.streak > highestStreak) {
        highestStreak = streak.streak;
      }
    });

    // Get current streak if month is current month
    const now = new Date();
    if (year === now.getFullYear() && monthNum === now.getMonth()) {
      const latestStreak = await this.prisma.userStreakCounter.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      currentStreak = latestStreak?.streak || 0;
    }

    const activityRate = (activeDays / totalDays) * 100;

    return {
      month: `${year}-${String(monthNum + 1).padStart(2, '0')}`,
      activeDays,
      totalDays,
      activityRate: parseFloat(activityRate.toFixed(2)),
      highestStreak,
      currentStreak,
      calendar,
    };
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntryDto[]> {
    const users = await this.prisma.user.findMany({
      include: {
        UserStreakCounter: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const leaderboardData = users
      .filter((user) => user.UserStreakCounter.length > 0)
      .map((user) => {
        const streakRecord = user.UserStreakCounter[0];
        const lastDate = new Date(streakRecord.lastDate);
        const lastDateOnly = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const daysDiff = Math.floor((today.getTime() - lastDateOnly.getTime()) / (1000 * 60 * 60 * 24));

        return {
          userId: user.id,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
          userImage: user.profileImage || '',
          currentStreak: streakRecord.streak,
          lastActivityDate: lastDate.toISOString().split('T')[0],
          isActive: daysDiff <= 1,
          rank: 0,
        };
      })
      .sort((a, b) => b.currentStreak - a.currentStreak)
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

  private checkMilestone(previousStreak: number, newStreak: number): StreakMilestoneDto | undefined {
    const achievedMilestone = this.MILESTONES.find(
      (m) => newStreak >= m && previousStreak < m
    );

    if (achievedMilestone) {
      return {
        milestone: achievedMilestone,
        description: this.getMilestoneDescription(achievedMilestone),
        reward: this.getMilestoneReward(achievedMilestone),
        achievedAt: new Date(),
      };
    }

    return undefined;
  }

  private getMilestoneDescription(milestone: number): string {
    const descriptions: Record<number, string> = {
      3: '3 Day Streak - Getting Started! 🌱',
      7: '7 Day Streak - One Week Warrior! 💪',
      14: '14 Day Streak - Two Week Champion! 🏆',
      21: '21 Day Streak - Habit Builder! 🔨',
      30: '30 Day Streak - Monthly Master! 👑',
      50: '50 Day Streak - Consistency King! 🦁',
      75: '75 Day Streak - Dedication Diamond! 💎',
      100: '100 Day Streak - Century Centurion! ⚔️',
      150: '150 Day Streak - Legendary Status! 🌟',
      200: '200 Day Streak - Unstoppable Force! 🚀',
      365: '365 Day Streak - Year Long Legend! 🎉',
    };

    return descriptions[milestone] || `${milestone} Day Streak!`;
  }

  private getMilestoneReward(milestone: number): string {
    const rewards: Record<number, string> = {
      3: '🌱 Seedling Badge',
      7: '💪 Week Warrior Badge',
      14: '🏆 Champion Badge',
      21: '🔨 Habit Master Badge',
      30: '👑 Monthly King Badge',
      50: '🦁 Consistency Lion Badge',
      75: '💎 Diamond Badge',
      100: '⚔️ Centurion Badge',
      150: '🌟 Legendary Badge',
      200: '🚀 Unstoppable Badge',
      365: '🎉 Year Legend Badge',
    };

    return rewards[milestone] || `🏅 ${milestone} Day Badge`;
  }

  private getStreakMessage(streak: number, wasAlreadyActive: boolean): string {
    if (wasAlreadyActive) {
      return `You're already active today! Keep your ${streak}-day streak going! 🔥`;
    }

    if (streak === 1) {
      return "Great start! Let's build that streak! 🌟";
    } else if (streak < 7) {
      return `Awesome! You're on a ${streak}-day streak! Keep it up! 💪`;
    } else if (streak < 30) {
      return `Amazing! ${streak} days in a row! You're unstoppable! 🔥`;
    } else if (streak < 100) {
      return `Incredible! ${streak}-day streak! You're a legend! 👑`;
    } else {
      return `WOW! ${streak} days! You're absolutely phenomenal! 🚀`;
    }
  }
}
