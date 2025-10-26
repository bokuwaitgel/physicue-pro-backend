import { Injectable, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

//dtos
import { 
  CreateSleepDto,
  UpdateSleepDto,
  SleepQueryDto,
  SleepAnalyticsDto,
  SleepResponseDto,
} from './sleep.dto';

@Injectable()
export class SleepService {
  
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  async create(createSleepDto: CreateSleepDto, authenticatedUserId?: string) {
    const userId = createSleepDto.userId || authenticatedUserId;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        status: false,
        type: 'fail',
        code: HttpStatus.NOT_FOUND,
        message: 'User not found'
      };
    }

    // Validate sleep times
    const sleepTime = new Date(createSleepDto.sleepTime);
    const wakeTime = new Date(createSleepDto.wakeTime);

    if (wakeTime <= sleepTime) {
      throw new BadRequestException('Wake time must be after sleep time');
    }

    const duration = (wakeTime.getTime() - sleepTime.getTime()) / (1000 * 60 * 60); // hours

    if (duration > 24) {
      throw new BadRequestException('Sleep duration cannot exceed 24 hours');
    }

    const sleepRecord = await this.prisma.sleepHistory.create({
      data: {
        sleepTime,
        wakeTime,
        userId: user.id
      }
    });

    return {
      status: true,
      type: 'success',
      message: 'Sleep record created successfully',
      code: HttpStatus.CREATED,
      data: {
        ...sleepRecord,
        duration: parseFloat(duration.toFixed(2))
      }
    };
  }

  async update(sleepId: string, updateSleepDto: UpdateSleepDto, userId: string) {
    const sleepRecord = await this.prisma.sleepHistory.findUnique({
      where: { id: sleepId }
    });

    if (!sleepRecord) {
      throw new NotFoundException('Sleep record not found');
    }

    if (sleepRecord.userId !== userId) {
      throw new BadRequestException('You can only update your own sleep records');
    }

    const updatedRecord = await this.prisma.sleepHistory.update({
      where: { id: sleepId },
      data: updateSleepDto
    });

    const duration = (updatedRecord.wakeTime.getTime() - updatedRecord.sleepTime.getTime()) / (1000 * 60 * 60);

    return {
      status: true,
      type: 'success',
      message: 'Sleep record updated successfully',
      code: HttpStatus.OK,
      data: {
        ...updatedRecord,
        duration: parseFloat(duration.toFixed(2))
      }
    };
  }

  async delete(sleepId: string, userId: string) {
    const sleepRecord = await this.prisma.sleepHistory.findUnique({
      where: { id: sleepId }
    });

    if (!sleepRecord) {
      throw new NotFoundException('Sleep record not found');
    }

    if (sleepRecord.userId !== userId) {
      throw new BadRequestException('You can only delete your own sleep records');
    }

    await this.prisma.sleepHistory.delete({
      where: { id: sleepId }
    });

    return {
      status: true,
      type: 'success',
      message: 'Sleep record deleted successfully',
      code: HttpStatus.OK
    };
  }

  // ============================================================================
  // RETRIEVAL & ANALYTICS
  // ============================================================================

  async getSleepTimes(userId: string, query?: SleepQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        status: false,
        type: 'fail',
        code: HttpStatus.NOT_FOUND,
        message: 'User not found'
      };
    }

    const where: any = { userId: user.id };

    if (query?.startDate || query?.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const sleepRecords = await this.prisma.sleepHistory.findMany({
      where,
      orderBy: { sleepTime: 'desc' },
      take: query?.limit || 30
    });

    const sleepData = sleepRecords.map(record => {
      const duration = (record.wakeTime.getTime() - record.sleepTime.getTime()) / (1000 * 60 * 60);
      return {
        ...record,
        duration: parseFloat(duration.toFixed(2))
      };
    });

    const totalSleep = sleepData.reduce((acc, curr) => acc + curr.duration, 0);
    const avgSleep = sleepRecords.length > 0 ? totalSleep / sleepRecords.length : 0;
    const lastDaySleep = sleepData.length > 0 ? sleepData[0].duration : 0;

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        total_sleep_hours: parseFloat(totalSleep.toFixed(2)),
        average_sleep_hours: parseFloat(avgSleep.toFixed(2)),
        last_sleep_hours: parseFloat(lastDaySleep.toFixed(2)),
        total_records: sleepRecords.length,
        sleep_history: sleepData
      }
    };
  }

  async getSleepById(sleepId: string, userId: string) {
    const sleepRecord = await this.prisma.sleepHistory.findUnique({
      where: { id: sleepId }
    });

    if (!sleepRecord) {
      throw new NotFoundException('Sleep record not found');
    }

    if (sleepRecord.userId !== userId) {
      throw new BadRequestException('You can only view your own sleep records');
    }

    const duration = (sleepRecord.wakeTime.getTime() - sleepRecord.sleepTime.getTime()) / (1000 * 60 * 60);

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        ...sleepRecord,
        duration: parseFloat(duration.toFixed(2))
      }
    };
  }

  async getWeeklySummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sleepRecords = await this.prisma.sleepHistory.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { sleepTime: 'desc' }
    });

    const dailyData = this.groupByDay(sleepRecords);
    const totalHours = sleepRecords.reduce((acc, record) => {
      const duration = (record.wakeTime.getTime() - record.sleepTime.getTime()) / (1000 * 60 * 60);
      return acc + duration;
    }, 0);

    const avgHours = sleepRecords.length > 0 ? totalHours / sleepRecords.length : 0;

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        period: 'Last 7 days',
        total_records: sleepRecords.length,
        total_hours: parseFloat(totalHours.toFixed(2)),
        average_hours: parseFloat(avgHours.toFixed(2)),
        daily_breakdown: dailyData,
        recommendation: this.getSleepRecommendation(avgHours)
      }
    };
  }

  async getMonthlySummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sleepRecords = await this.prisma.sleepHistory.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { sleepTime: 'desc' }
    });

    const weeklyData = this.groupByWeek(sleepRecords);
    const totalHours = sleepRecords.reduce((acc, record) => {
      const duration = (record.wakeTime.getTime() - record.sleepTime.getTime()) / (1000 * 60 * 60);
      return acc + duration;
    }, 0);

    const avgHours = sleepRecords.length > 0 ? totalHours / sleepRecords.length : 0;
    const sleepDebt = this.calculateSleepDebt(sleepRecords, 8); // Assuming 8 hours target

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        period: 'Last 30 days',
        total_records: sleepRecords.length,
        total_hours: parseFloat(totalHours.toFixed(2)),
        average_hours: parseFloat(avgHours.toFixed(2)),
        sleep_debt_hours: parseFloat(sleepDebt.toFixed(2)),
        weekly_breakdown: weeklyData,
        consistency_score: this.calculateConsistencyScore(sleepRecords),
        trend: this.determineTrend(sleepRecords),
        recommendation: this.getSleepRecommendation(avgHours)
      }
    };
  }

  async getAnalytics(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sleepRecords = await this.prisma.sleepHistory.findMany({
      where: { userId: user.id },
      orderBy: { sleepTime: 'desc' }
    });

    if (sleepRecords.length === 0) {
      return {
        status: true,
        type: 'success',
        code: HttpStatus.OK,
        message: 'Sleep analytics retrieved successfully',
        data: {
          totalRecords: 0,
          averageSleepHours: 0,
          totalSleepHours: 0,
          bestSleepDuration: 0,
          worstSleepDuration: 0,
          sleepDebt: 0,
          consistencyScore: 0,
          weeklyAverage: 0,
          monthlyAverage: 0,
          trend: 'stable',
          recommendations: ['Start tracking your sleep to get personalized insights']
        }
      };
    }

    const durations = sleepRecords.map(record => 
      (record.wakeTime.getTime() - record.sleepTime.getTime()) / (1000 * 60 * 60)
    );

    const totalHours = durations.reduce((acc, curr) => acc + curr, 0);
    const avgHours = totalHours / sleepRecords.length;

    // Get last 7 days average
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const lastWeekRecords = sleepRecords.filter(r => new Date(r.createdAt) >= sevenDaysAgo);
    const weeklyAvg = lastWeekRecords.length > 0 
      ? lastWeekRecords.reduce((acc, r) => acc + ((r.wakeTime.getTime() - r.sleepTime.getTime()) / (1000 * 60 * 60)), 0) / lastWeekRecords.length 
      : 0;

    // Get last 30 days average
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const lastMonthRecords = sleepRecords.filter(r => new Date(r.createdAt) >= thirtyDaysAgo);
    const monthlyAvg = lastMonthRecords.length > 0 
      ? lastMonthRecords.reduce((acc, r) => acc + ((r.wakeTime.getTime() - r.sleepTime.getTime()) / (1000 * 60 * 60)), 0) / lastMonthRecords.length 
      : 0;

    return {
      status: true, 
      type: 'success',
      code: HttpStatus.OK,
      message: 'Sleep analytics retrieved successfully',
      data: {
        totalRecords: sleepRecords.length,
        averageSleepHours: parseFloat(avgHours.toFixed(2)),
        totalSleepHours: parseFloat(totalHours.toFixed(2)),
        bestSleepDuration: parseFloat(Math.max(...durations).toFixed(2)),
        worstSleepDuration: parseFloat(Math.min(...durations).toFixed(2)),
        sleepDebt: parseFloat(this.calculateSleepDebt(sleepRecords, 8).toFixed(2)),
        consistencyScore: this.calculateConsistencyScore(sleepRecords),
        weeklyAverage: parseFloat(weeklyAvg.toFixed(2)),
        monthlyAverage: parseFloat(monthlyAvg.toFixed(2)),
        trend: this.determineTrend(sleepRecords),
        recommendations: this.generateRecommendations(avgHours, this.calculateConsistencyScore(sleepRecords))
      }
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private groupByDay(records: any[]) {
    const grouped = {};
    records.forEach(record => {
      const date = new Date(record.sleepTime).toISOString().split('T')[0];
      const duration = (record.wakeTime.getTime() - record.sleepTime.getTime()) / (1000 * 60 * 60);
      
      if (!grouped[date]) {
        grouped[date] = { date, total_hours: 0, count: 0 };
      }
      grouped[date].total_hours += duration;
      grouped[date].count += 1;
    });

    return Object.values(grouped).map((day: any) => ({
      date: day.date,
      hours: parseFloat(day.total_hours.toFixed(2)),
      average: parseFloat((day.total_hours / day.count).toFixed(2))
    }));
  }

  private groupByWeek(records: any[]) {
    const grouped = {};
    records.forEach(record => {
      const date = new Date(record.sleepTime);
      const weekNumber = this.getWeekNumber(date);
      const duration = (record.wakeTime.getTime() - record.sleepTime.getTime()) / (1000 * 60 * 60);
      
      if (!grouped[weekNumber]) {
        grouped[weekNumber] = { week: weekNumber, total_hours: 0, count: 0 };
      }
      grouped[weekNumber].total_hours += duration;
      grouped[weekNumber].count += 1;
    });

    return Object.values(grouped).map((week: any) => ({
      week: week.week,
      hours: parseFloat(week.total_hours.toFixed(2)),
      average: parseFloat((week.total_hours / week.count).toFixed(2))
    }));
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private calculateSleepDebt(records: any[], targetHours: number): number {
    const debt = records.reduce((acc, record) => {
      const duration = (record.wakeTime.getTime() - record.sleepTime.getTime()) / (1000 * 60 * 60);
      return acc + Math.max(0, targetHours - duration);
    }, 0);
    return debt;
  }

  private calculateConsistencyScore(records: any[]): number {
    if (records.length < 2) return 100;

    const bedtimes = records.map(r => {
      const time = new Date(r.sleepTime);
      return time.getHours() + time.getMinutes() / 60;
    });

    const avgBedtime = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    const variance = bedtimes.reduce((acc, time) => acc + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length;
    const stdDev = Math.sqrt(variance);

    // Score from 0-100, lower std dev = higher score
    const score = Math.max(0, 100 - (stdDev * 10));
    return Math.round(score);
  }

  private determineTrend(records: any[]): 'improving' | 'declining' | 'stable' {
    if (records.length < 7) return 'stable';

    const recentRecords = records.slice(0, 7);
    const olderRecords = records.slice(7, 14);

    if (olderRecords.length === 0) return 'stable';

    const recentAvg = recentRecords.reduce((acc, r) => {
      return acc + ((r.wakeTime.getTime() - r.sleepTime.getTime()) / (1000 * 60 * 60));
    }, 0) / recentRecords.length;

    const olderAvg = olderRecords.reduce((acc, r) => {
      return acc + ((r.wakeTime.getTime() - r.sleepTime.getTime()) / (1000 * 60 * 60));
    }, 0) / olderRecords.length;

    const diff = recentAvg - olderAvg;

    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  }

  private getSleepRecommendation(avgHours: number): string {
    if (avgHours < 6) {
      return 'You are significantly under-sleeping. Aim for 7-9 hours per night for optimal health.';
    } else if (avgHours < 7) {
      return 'You could benefit from a bit more sleep. Try to get at least 7 hours per night.';
    } else if (avgHours >= 7 && avgHours <= 9) {
      return 'Great job! You are getting a healthy amount of sleep.';
    } else {
      return 'You might be sleeping too much. Aim for 7-9 hours for optimal rest.';
    }
  }

  private generateRecommendations(avgHours: number, consistencyScore: number): string[] {
    const recommendations: string[] = [];

    if (avgHours < 7) {
      recommendations.push('Aim for 7-9 hours of sleep per night');
      recommendations.push('Try setting a consistent bedtime');
    } else if (avgHours > 9) {
      recommendations.push('You may be over-sleeping. Aim for 7-9 hours');
    } else {
      recommendations.push('You are getting a healthy amount of sleep!');
    }

    if (consistencyScore < 70) {
      recommendations.push('Try to maintain a more consistent sleep schedule');
      recommendations.push('Go to bed and wake up at the same time daily');
    } else {
      recommendations.push('Great consistency! Keep maintaining your sleep schedule');
    }

    recommendations.push('Avoid screens 1 hour before bedtime');
    recommendations.push('Create a relaxing bedtime routine');

    return recommendations;
  }
}
