import { Injectable, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMealDto,
  UpdateMealDto,
  MealQueryDto,
  MealResponseDto,
  TrackDailyMealDto,
  UpdateDailyMealDto,
  NutritionAnalyticsDto,
  CreateCustomCalorieDto,
  UpdateCustomCalorieDto,
  CustomCalorieQueryDto,
  CustomCalorieResponseDto,
  DailyCustomCalorieSummaryDto,
  CreateIngredientDto,
  UpdateIngredientDto,
  IngredientResponseDto,
  CreateMealPlanDto,
  UpdateMealPlanDto,
  MealPlanResponseDto,
} from './meal-plan.dto';
import axios from 'axios';

@Injectable()
export class MealPlanService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // MEAL CRUD OPERATIONS
  // ============================================================================

  async createMeal(createMealDto: CreateMealDto, _userId?: string) {
    const meal = await this.prisma.meal.create({
      data: {
        createdBy: _userId || 'auto',
        name: createMealDto.name,
        image: createMealDto.image,
        description: createMealDto.description,
        type: createMealDto.type,
      },
      include: {
        Ingredient: true,
      },
    });

    return {
      status: true,
      type: 'success',
      message: 'Meal created successfully',
      code: HttpStatus.CREATED,
      data: this.formatMealResponse(meal),
    };
  }

  async getMealByCreatedBy(userId: string) {
    const meals = await this.prisma.meal.findMany({
      where: { createdBy: userId },
      include: {
        Ingredient: true,
      },
    });

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: meals.map((meal) => this.formatMealResponse(meal)),
    };
  }

  async getMeal(mealId: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        Ingredient: true,
      },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: this.formatMealResponse(meal),
    };
  }

  async getMeals(query?: MealQueryDto) {
    const where: any = {};

    if (query?.mealType) {
      where.type = query.mealType;
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

    const meals = await this.prisma.meal.findMany({
      where,
      include: {
        Ingredient: true,
      },
      orderBy: { createdAt: 'desc' },
      take: query?.limit || 50,
    });

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: meals.map((meal) => this.formatMealResponse(meal)),
    };
  }

  async updateMeal(mealId: string, updateMealDto: UpdateMealDto) {
    const existingMeal = await this.prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!existingMeal) {
      throw new NotFoundException('Meal not found');
    }

    const updatedMeal = await this.prisma.meal.update({
      where: { id: mealId },
      data: {
        ...updateMealDto,
      },
      include: {
        Ingredient: true,
      },
    });

    return {
      status: true,
      type: 'success',
      message: 'Meal updated successfully',
      code: HttpStatus.OK,
      data: this.formatMealResponse(updatedMeal),
    };
  }

  async deleteMeal(mealId: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    await this.prisma.ingredient.deleteMany({
      where: { mealId },
    });

    await this.prisma.mealPlan.deleteMany({
      where: { mealId },
    });

    await this.prisma.meal.delete({
      where: { id: mealId },
    });

    return {
      status: true,
      type: 'success',
      message: 'Meal deleted successfully',
      code: HttpStatus.OK,
    };
  }

  // ============================================================================
  // DAILY MEAL TRACKING
  // ============================================================================

  async trackDailyMeal(trackDailyMealDto: TrackDailyMealDto, authenticatedUserId?: string) {
    const userId = trackDailyMealDto.userId || authenticatedUserId;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const date = new Date(trackDailyMealDto.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // Check if record exists for this day
    const existing = await this.prisma.userMealTrackerDaily.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let result;
    if (existing) {
      // Update existing record
      result = await this.prisma.userMealTrackerDaily.update({
        where: { id: existing.id },
        data: {
          kcal: existing.kcal + trackDailyMealDto.kcal,
          protein: existing.protein + trackDailyMealDto.protein,
          carbs: existing.carbs + trackDailyMealDto.carbs,
          fats: existing.fats + trackDailyMealDto.fats,
        },
      });
    } else {
      // Create new record
      result = await this.prisma.userMealTrackerDaily.create({
        data: {
          userId,
          date: startOfDay,
          kcal: trackDailyMealDto.kcal,
          protein: trackDailyMealDto.protein,
          carbs: trackDailyMealDto.carbs,
          fats: trackDailyMealDto.fats,
        },
      });
    }

    return {
      status: true,
      type: 'success',
      message: existing ? 'Daily meal updated successfully' : 'Daily meal tracked successfully',
      code: existing ? HttpStatus.OK : HttpStatus.CREATED,
      data: result,
    };
  }

  async getDailyTracking(userId: string, date?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const tracking = await this.prisma.userMealTrackerDaily.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    //calculate total if multiple entries exist for the day
    const total = tracking.reduce((acc, curr) => {
      acc.kcal += curr.kcal;
      acc.protein += curr.protein;
      acc.carbs += curr.carbs;
      acc.fats += curr.fats;
      return acc;
    }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });

  

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: total,
    };
  }

  async getWeeklyTracking(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trackingRecords = await this.prisma.userMealTrackerDaily.findMany({
      where: {
        userId,
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalKcal = trackingRecords.reduce((sum, record) => sum + record.kcal, 0);
    const totalProtein = trackingRecords.reduce((sum, record) => sum + record.protein, 0);
    const totalCarbs = trackingRecords.reduce((sum, record) => sum + record.carbs, 0);
    const totalFats = trackingRecords.reduce((sum, record) => sum + record.fats, 0);

    const avgKcal = trackingRecords.length > 0 ? totalKcal / trackingRecords.length : 0;
    const avgProtein = trackingRecords.length > 0 ? totalProtein / trackingRecords.length : 0;
    const avgCarbs = trackingRecords.length > 0 ? totalCarbs / trackingRecords.length : 0;
    const avgFats = trackingRecords.length > 0 ? totalFats / trackingRecords.length : 0;

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        period: 'Last 7 days',
        totalDays: trackingRecords.length,
        average: {
          calories: parseFloat(avgKcal.toFixed(2)),
          protein: parseFloat(avgProtein.toFixed(2)),
          carbs: parseFloat(avgCarbs.toFixed(2)),
          fats: parseFloat(avgFats.toFixed(2)),
        },
        total: {
          calories: parseFloat(totalKcal.toFixed(2)),
          protein: parseFloat(totalProtein.toFixed(2)),
          carbs: parseFloat(totalCarbs.toFixed(2)),
          fats: parseFloat(totalFats.toFixed(2)),
        },
        daily_records: trackingRecords,
      },
    };
  }

  async getMonthlyTracking(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trackingRecords = await this.prisma.userMealTrackerDaily.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalKcal = trackingRecords.reduce((sum, record) => sum + record.kcal, 0);
    const totalProtein = trackingRecords.reduce((sum, record) => sum + record.protein, 0);
    const totalCarbs = trackingRecords.reduce((sum, record) => sum + record.carbs, 0);
    const totalFats = trackingRecords.reduce((sum, record) => sum + record.fats, 0);

    const avgKcal = trackingRecords.length > 0 ? totalKcal / trackingRecords.length : 0;
    const avgProtein = trackingRecords.length > 0 ? totalProtein / trackingRecords.length : 0;
    const avgCarbs = trackingRecords.length > 0 ? totalCarbs / trackingRecords.length : 0;
    const avgFats = trackingRecords.length > 0 ? totalFats / trackingRecords.length : 0;

    const weeklyData = this.groupByWeek(trackingRecords);

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        period: 'Last 30 days',
        totalDays: trackingRecords.length,
        average: {
          calories: parseFloat(avgKcal.toFixed(2)),
          protein: parseFloat(avgProtein.toFixed(2)),
          carbs: parseFloat(avgCarbs.toFixed(2)),
          fats: parseFloat(avgFats.toFixed(2)),
        },
        total: {
          calories: parseFloat(totalKcal.toFixed(2)),
          protein: parseFloat(totalProtein.toFixed(2)),
          carbs: parseFloat(totalCarbs.toFixed(2)),
          fats: parseFloat(totalFats.toFixed(2)),
        },
        weekly_breakdown: weeklyData,
        trend: this.determineTrend(trackingRecords),
        recommendations: this.generateNutritionRecommendations(avgKcal, avgProtein, avgCarbs, avgFats),
      },
    };
  }

  async getNutritionAnalytics(userId: string): Promise<NutritionAnalyticsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allRecords = await this.prisma.userMealTrackerDaily.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (allRecords.length === 0) {
      return {
        totalDays: 0,
        averageCalories: 0,
        averageProtein: 0,
        averageCarbs: 0,
        averageFats: 0,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        adherenceScore: 0,
        trend: 'stable',
        recommendations: ['Start tracking your meals to get personalized nutrition insights'],
      };
    }

    const totalKcal = allRecords.reduce((sum, r) => sum + r.kcal, 0);
    const totalProtein = allRecords.reduce((sum, r) => sum + r.protein, 0);
    const totalCarbs = allRecords.reduce((sum, r) => sum + r.carbs, 0);
    const totalFats = allRecords.reduce((sum, r) => sum + r.fats, 0);

    const avgKcal = totalKcal / allRecords.length;
    const avgProtein = totalProtein / allRecords.length;
    const avgCarbs = totalCarbs / allRecords.length;
    const avgFats = totalFats / allRecords.length;

    // Standard goals (can be customized per user)
    const calorieGoal = 2000;
    const proteinGoal = 150;
    const carbsGoal = 200;
    const fatsGoal = 65;

    const adherenceScore = this.calculateAdherenceScore(
      avgKcal,
      avgProtein,
      avgCarbs,
      avgFats,
      calorieGoal,
      proteinGoal,
      carbsGoal,
      fatsGoal
    );

    return {
      totalDays: allRecords.length,
      averageCalories: parseFloat(avgKcal.toFixed(2)),
      averageProtein: parseFloat(avgProtein.toFixed(2)),
      averageCarbs: parseFloat(avgCarbs.toFixed(2)),
      averageFats: parseFloat(avgFats.toFixed(2)),
      totalCalories: parseFloat(totalKcal.toFixed(2)),
      totalProtein: parseFloat(totalProtein.toFixed(2)),
      totalCarbs: parseFloat(totalCarbs.toFixed(2)),
      totalFats: parseFloat(totalFats.toFixed(2)),
      calorieGoal,
      proteinGoal,
      carbsGoal,
      fatsGoal,
      adherenceScore,
      trend: this.determineTrend(allRecords),
      recommendations: this.generateNutritionRecommendations(avgKcal, avgProtein, avgCarbs, avgFats),
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private formatMealResponse(meal: any): MealResponseDto {
    return {
      id: meal.id,
      name: meal.name,
      image: meal.image,
      description: meal.description,
      type: meal.type,
      createdAt: meal.createdAt,
      updatedAt: meal.updatedAt,
      Ingredient: meal.Ingredient
        ? meal.Ingredient.map((ingredient) => this.formatIngredientResponse(ingredient))
        : [],
    };
  }

  private formatIngredientResponse(ingredient: any): IngredientResponseDto {
    return {
      id: ingredient.id,
      mealId: ingredient.mealId,
      name: ingredient.name,
      image: ingredient.image,
      quantity: ingredient.quantity,
      createdAt: ingredient.createdAt,
      updatedAt: ingredient.updatedAt,
    };
  }

  private formatMealPlanResponse(mealPlan: any): MealPlanResponseDto {
    return {
      id: mealPlan.id,
      courseId: mealPlan.courseId,
      day: mealPlan.day,
      mealId: mealPlan.mealId,
      createdAt: mealPlan.createdAt,
      updatedAt: mealPlan.updatedAt,
      meal: mealPlan.meal ? this.formatMealResponse(mealPlan.meal) : undefined,
    };
  }

  private groupByWeek(records: any[]) {
    const grouped = {};
    records.forEach((record) => {
      const weekNumber = this.getWeekNumber(new Date(record.date));
      if (!grouped[weekNumber]) {
        grouped[weekNumber] = {
          week: weekNumber,
          kcal: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          count: 0,
        };
      }
      grouped[weekNumber].kcal += record.kcal;
      grouped[weekNumber].protein += record.protein;
      grouped[weekNumber].carbs += record.carbs;
      grouped[weekNumber].fats += record.fats;
      grouped[weekNumber].count += 1;
    });

    return Object.values(grouped).map((week: any) => ({
      week: week.week,
      average: {
        calories: parseFloat((week.kcal / week.count).toFixed(2)),
        protein: parseFloat((week.protein / week.count).toFixed(2)),
        carbs: parseFloat((week.carbs / week.count).toFixed(2)),
        fats: parseFloat((week.fats / week.count).toFixed(2)),
      },
      total: {
        calories: parseFloat(week.kcal.toFixed(2)),
        protein: parseFloat(week.protein.toFixed(2)),
        carbs: parseFloat(week.carbs.toFixed(2)),
        fats: parseFloat(week.fats.toFixed(2)),
      },
    }));
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private determineTrend(records: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (records.length < 7) return 'stable';

    const recentRecords = records.slice(0, 7);
    const olderRecords = records.slice(7, 14);

    if (olderRecords.length === 0) return 'stable';

    const recentAvg = recentRecords.reduce((sum, r) => sum + r.kcal, 0) / recentRecords.length;
    const olderAvg = olderRecords.reduce((sum, r) => sum + r.kcal, 0) / olderRecords.length;

    const diff = recentAvg - olderAvg;

    if (diff > 100) return 'increasing';
    if (diff < -100) return 'decreasing';
    return 'stable';
  }

  private calculateAdherenceScore(
    avgKcal: number,
    avgProtein: number,
    avgCarbs: number,
    avgFats: number,
    calorieGoal: number,
    proteinGoal: number,
    carbsGoal: number,
    fatsGoal: number
  ): number {
    const calorieScore = Math.max(0, 100 - Math.abs((avgKcal - calorieGoal) / calorieGoal) * 100);
    const proteinScore = Math.max(0, 100 - Math.abs((avgProtein - proteinGoal) / proteinGoal) * 100);
    const carbsScore = Math.max(0, 100 - Math.abs((avgCarbs - carbsGoal) / carbsGoal) * 100);
    const fatsScore = Math.max(0, 100 - Math.abs((avgFats - fatsGoal) / fatsGoal) * 100);

    return Math.round((calorieScore + proteinScore + carbsScore + fatsScore) / 4);
  }

  private generateNutritionRecommendations(
    avgKcal: number,
    avgProtein: number,
    avgCarbs: number,
    avgFats: number
  ): string[] {
    const recommendations: string[] = [];

    if (avgKcal < 1500) {
      recommendations.push('Your calorie intake is quite low. Consider increasing to meet your energy needs.');
    } else if (avgKcal > 2500) {
      recommendations.push('Your calorie intake is high. Consider moderating portions for weight management.');
    } else {
      recommendations.push('Your calorie intake is within a healthy range!');
    }

    if (avgProtein < 100) {
      recommendations.push('Increase protein intake for muscle recovery and satiety.');
    } else if (avgProtein >= 100 && avgProtein <= 200) {
      recommendations.push('Great protein intake! Keep it up for optimal health.');
    }

    if (avgCarbs < 150) {
      recommendations.push('Consider adding more complex carbohydrates for sustained energy.');
    }

    if (avgFats < 40) {
      recommendations.push('Include healthy fats like avocados, nuts, and olive oil.');
    } else if (avgFats > 80) {
      recommendations.push('Consider moderating fat intake for balanced nutrition.');
    }

    recommendations.push('Stay hydrated and eat plenty of vegetables and fruits.');
    recommendations.push('Aim for balanced meals with protein, carbs, and healthy fats.');

    return recommendations;
  }

  // ============================================================================
  // CUSTOM CALORIE ENTRY METHODS
  // ============================================================================

  async addCustomCalorie(createCustomCalorieDto: CreateCustomCalorieDto, authenticatedUserId?: string) {
    const userId = createCustomCalorieDto.userId || authenticatedUserId;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const consumedAt = createCustomCalorieDto.consumedAt ? new Date(createCustomCalorieDto.consumedAt) : new Date();

    const calorieEntry = await this.prisma.caloriesHistory.create({
      data: {
        userId,
        name: createCustomCalorieDto.name,
        caloriesIntake: createCustomCalorieDto.caloriesIntake,
        createdAt: consumedAt,
      },
    });

    // Auto-update daily tracker if macros are provided
    if (createCustomCalorieDto.protein || createCustomCalorieDto.carbs || createCustomCalorieDto.fats) {
      await this.updateDailyTrackerFromCustomEntry(
        userId,
        consumedAt,
        createCustomCalorieDto.caloriesIntake,
        createCustomCalorieDto.protein || 0,
        createCustomCalorieDto.carbs || 0,
        createCustomCalorieDto.fats || 0
      );
    }

    return {
      status: true,
      type: 'success',
      message: 'Custom calorie entry added successfully',
      code: HttpStatus.CREATED,
      data: {
        ...calorieEntry,
        protein: createCustomCalorieDto.protein,
        carbs: createCustomCalorieDto.carbs,
        fats: createCustomCalorieDto.fats,
        portion: createCustomCalorieDto.portion,
        mealType: createCustomCalorieDto.mealType,
        consumedAt,
      },
    };
  }

  async getCustomCalorieEntry(entryId: string, userId: string) {
    const entry = await this.prisma.caloriesHistory.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return {
        status: false,
        type: 'error',
        message: 'Calorie entry not found',
        code: HttpStatus.NOT_FOUND,
      };
    }

  

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: entry,
    };
  }

  async getCustomCalorieEntries(userId: string, query?: CustomCalorieQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const where: any = { userId };

    if (query?.startDate || query?.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const entries = await this.prisma.caloriesHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query?.limit || 100,
    });

    const totalCalories = entries.reduce((sum, entry) => sum + entry.caloriesIntake, 0);

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        entries,
        totalEntries: entries.length,
        totalCalories: parseFloat(totalCalories.toFixed(2)),
      },
    };
  }

  async getDailyCustomCalorieSummary(userId: string, date?: string): Promise<DailyCustomCalorieSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const entries = await this.prisma.caloriesHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCalories = entries.reduce((sum, entry) => sum + entry.caloriesIntake, 0);

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalCalories: parseFloat(totalCalories.toFixed(2)),
      totalProtein: 0, // Will be calculated from entries with metadata
      totalCarbs: 0,
      totalFats: 0,
      entries: entries as any[],
      entriesCount: entries.length,
    };
  }

  async updateCustomCalorie(entryId: string, userId: string, updateCustomCalorieDto: UpdateCustomCalorieDto) {
    const entry = await this.prisma.caloriesHistory.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Calorie entry not found');
    }

    if (entry.userId !== userId) {
      throw new BadRequestException('You can only update your own calorie entries');
    }

    const updatedEntry = await this.prisma.caloriesHistory.update({
      where: { id: entryId },
      data: {
        name: updateCustomCalorieDto.name,
        caloriesIntake: updateCustomCalorieDto.caloriesIntake,
      },
    });

    return {
      status: true,
      type: 'success',
      message: 'Calorie entry updated successfully',
      code: HttpStatus.OK,
      data: {
        ...updatedEntry,
        protein: updateCustomCalorieDto.protein,
        carbs: updateCustomCalorieDto.carbs,
        fats: updateCustomCalorieDto.fats,
        portion: updateCustomCalorieDto.portion,
        mealType: updateCustomCalorieDto.mealType,
      },
    };
  }

  async deleteCustomCalorie(entryId: string, userId: string) {
    const entry = await this.prisma.caloriesHistory.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Calorie entry not found');
    }

    if (entry.userId !== userId) {
      throw new BadRequestException('You can only delete your own calorie entries');
    }

    await this.prisma.caloriesHistory.delete({
      where: { id: entryId },
    });

    return {
      status: true,
      type: 'success',
      message: 'Calorie entry deleted successfully',
      code: HttpStatus.OK,
    };
  }

  async getWeeklyCustomCalorieSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const entries = await this.prisma.caloriesHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const dailyBreakdown = this.groupEntriesByDay(entries);
    const totalCalories = entries.reduce((sum, entry) => sum + entry.caloriesIntake, 0);
    const avgCalories = entries.length > 0 ? totalCalories / 7 : 0;

    return {
      status: true,
      type: 'success',
      code: HttpStatus.OK,
      data: {
        period: 'Last 7 days',
        totalEntries: entries.length,
        totalCalories: parseFloat(totalCalories.toFixed(2)),
        averageCaloriesPerDay: parseFloat(avgCalories.toFixed(2)),
        dailyBreakdown,
      },
    };
  }

  // Private helper method to update daily tracker
  private async updateDailyTrackerFromCustomEntry(
    userId: string,
    date: Date,
    calories: number,
    protein: number,
    carbs: number,
    fats: number
  ) {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const existing = await this.prisma.userMealTrackerDaily.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existing) {
      // Add to existing
      await this.prisma.userMealTrackerDaily.update({
        where: { id: existing.id },
        data: {
          kcal: existing.kcal + calories,
          protein: existing.protein + protein,
          carbs: existing.carbs + carbs,
          fats: existing.fats + fats,
        },
      });
    } else {
      // Create new
      await this.prisma.userMealTrackerDaily.create({
        data: {
          userId,
          date: startOfDay,
          kcal: calories,
          protein,
          carbs,
          fats,
        },
      });
    }
  }

  private groupEntriesByDay(entries: any[]) {
    const grouped = {};
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = {
          date,
          calories: 0,
          count: 0,
          entries: [],
        };
      }
      grouped[date].calories += entry.caloriesIntake;
      grouped[date].count += 1;
      grouped[date].entries.push(entry);
    });

    return Object.values(grouped).map((day: any) => ({
      date: day.date,
      totalCalories: parseFloat(day.calories.toFixed(2)),
      entriesCount: day.count,
      entries: day.entries,
    }));
  }

  // ============================================================================
  // INGREDIENT OPERATIONS
  // ============================================================================

  async createIngredient(createIngredientDto: CreateIngredientDto) {
    const meal = await this.prisma.meal.findUnique({
      where: { id: createIngredientDto.mealId },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    const ingredient = await this.prisma.ingredient.create({
      data: {
        mealId: createIngredientDto.mealId,
        name: createIngredientDto.name,
        image: createIngredientDto.image,
        quantity: createIngredientDto.quantity,
      },
    });

    return {
      success: true,
      type: 'success',
      code: HttpStatus.CREATED,
      message: 'Ingredient created successfully',
      data: this.formatIngredientResponse(ingredient),
    };
  }

  async getMealIngredients(mealId: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    const ingredients = await this.prisma.ingredient.findMany({
      where: { mealId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      type: 'success',
      code: HttpStatus.OK,
      data: ingredients.map((ingredient) => this.formatIngredientResponse(ingredient)),
    };
  }

  async updateIngredient(ingredientId: string, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    const updated = await this.prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        ...updateIngredientDto,
      },
    });

    return {
      success: true,
      type: 'success',
      code: HttpStatus.OK,
      message: 'Ingredient updated successfully',
      data: this.formatIngredientResponse(updated),
    };
  }

  async deleteIngredient(ingredientId: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    await this.prisma.ingredient.delete({
      where: { id: ingredientId },
    });

    return {
      success: true,
      type: 'success',
      code: HttpStatus.OK,
      message: 'Ingredient deleted successfully',
    };
  }

  // ============================================================================
  // MEAL PLAN OPERATIONS (Course Meal Plans)
  // ============================================================================

  async createMealPlan(createMealPlanDto: CreateMealPlanDto) {
    const meal = await this.prisma.meal.findUnique({
      where: { id: createMealPlanDto.mealId },
      include: { Ingredient: true },
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    const mealPlan = await this.prisma.mealPlan.create({
      data: {
        courseId: createMealPlanDto.courseId,
        day: createMealPlanDto.day,
        mealId: createMealPlanDto.mealId,
      },
      include: {
        meal: {
          include: {
            Ingredient: true,
          },
        },
      },
    });

    return {
      success: true,
      type: 'success',
      code: HttpStatus.CREATED,
      message: 'Meal plan created successfully',
      data: this.formatMealPlanResponse(mealPlan),
    };
  }

  async getCourseMealPlan(courseId: string) {
    const mealPlans = await this.prisma.mealPlan.findMany({
      where: { courseId },
      include: {
        meal: {
          include: {
            Ingredient: true,
          },
        },
      },
      orderBy: { day: 'asc' },
    });

    return {
      success: true,
      type: 'success',
      code: HttpStatus.OK,
      data: mealPlans.map((plan) => this.formatMealPlanResponse(plan)),
    };
  }

  async getCourseDayMeals(courseId: string, day: number) {
    const mealPlans = await this.prisma.mealPlan.findMany({
      where: {
        courseId,
        day,
      },
      include: {
        meal: {
          include: {
            Ingredient: true,
          },
        },
      },
    });

    return {
      success: true,
      type: 'success',
      code: HttpStatus.OK,
      data: mealPlans.map((plan) => this.formatMealPlanResponse(plan)),
    };
  }

  async updateMealPlan(mealPlanId: string, updateMealPlanDto: UpdateMealPlanDto) {
    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
    });

    if (!mealPlan) {
      throw new NotFoundException('Meal plan not found');
    }

    if (updateMealPlanDto.mealId) {
      const meal = await this.prisma.meal.findUnique({
        where: { id: updateMealPlanDto.mealId },
      });

      if (!meal) {
        throw new NotFoundException('Meal not found');
      }
    }

    const updated = await this.prisma.mealPlan.update({
      where: { id: mealPlanId },
      data: {
        ...updateMealPlanDto,
      },
      include: {
        meal: {
          include: {
            Ingredient: true,
          },
        },
      },
    });

    return {
      success: true,
      type: 'success',
      code: HttpStatus.OK,
      message: 'Meal plan updated successfully',
      data: this.formatMealPlanResponse(updated),
    };
  }

  async deleteMealPlan(mealPlanId: string) {
    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
    });

    if (!mealPlan) {
      throw new NotFoundException('Meal plan not found');
    }

    await this.prisma.mealPlan.delete({
      where: { id: mealPlanId },
    });

    return {
      success: true,
      type: 'success',
      code: HttpStatus.OK,
      message: 'Meal plan deleted successfully',
    };
  }

  // ============================================================================
  // MEAL PLAN OPERATIONS (Course Meal Plans)
  // ============================================================================

  async uploadMealImage(userId: string, file: Express.Multer.File) { 
    // create post request to 3rd party image analize service
    const FormData = require('form-data');
    const data = new FormData();
    data.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    // IMAGE_TO_CALORIES_URL
    const url = process.env.IMAGE_TO_CALORIES_URL;
    
    if (!url) {
      return {
        success: false,
        type: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Image analysis service URL not configured',
      }
    }

    const response = await axios.post(url, data);

    // save result to database

    if (response.status !== 200) {
      return {
        success: false,
        type: 'error',
        code: HttpStatus.BAD_GATEWAY,
        message: 'Failed to analyze meal image',
      };
    }
    console.log('Image analysis response:', response.data);

    // save result to database
    // output -> food items with calories, protein, carbs, fats
    const analyzedData = response.data;
    const foodList = analyzedData.output.food || [];
    for (const foodItem of foodList) {
      const { name, calories, protein, carbs, fats } = foodItem;
      console.log('Saving food item:', foodItem);
      await this.prisma.mealTracker.create({
        data: {
          userId,
          name,
          kcal: calories,
          protein,
          carbs,
          fats,
          date: new Date(),
        },
      });
    }



    return {
      success: true,
      type: 'success',
      code: HttpStatus.OK,
      message: 'Meal image uploaded and analyzed successfully',
      data: foodList,
    };
    
  }

  async getMealImageAnalysisHistory(userId: string) {
    const records = await this.prisma.mealTracker.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return {      success: true,
      type: 'success',
      code: HttpStatus.OK,
      data: records,
    };
  }

d
}
