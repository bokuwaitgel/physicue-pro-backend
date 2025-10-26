import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, IsArray, IsEnum, Min } from 'class-validator';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

// ============================================================================
// MEAL DTOs
// ============================================================================

export class CreateMealDto {
  @ApiProperty({ description: 'Meal type', enum: MealType, example: MealType.BREAKFAST })
  @IsNotEmpty()
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({ description: 'Meal time', example: '2025-10-26T08:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  mealTime: Date;

  @ApiProperty({ description: 'Recipe IDs for this meal', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipeIds?: string[];
}

export class UpdateMealDto {
  @ApiProperty({ description: 'Meal type', enum: MealType, required: false })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiProperty({ description: 'Meal time', required: false })
  @IsOptional()
  @IsDateString()
  mealTime?: Date;

  @ApiProperty({ description: 'Recipe IDs for this meal', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipeIds?: string[];
}

// ============================================================================
// RECIPE DTOs
// ============================================================================

export class CreateRecipeDto {
  @ApiProperty({ description: 'Recipe name', example: 'Grilled Chicken Salad' })
  @IsNotEmpty()
  @IsString()
  recipe_name: string;

  @ApiProperty({ description: 'Recipe description', example: 'Healthy protein-rich salad' })
  @IsNotEmpty()
  @IsString()
  recipe_description: string;

  @ApiProperty({ description: 'Calories', example: 350, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiProperty({ description: 'Protein (g)', example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiProperty({ description: 'Carbohydrates (g)', example: 25, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs?: number;

  @ApiProperty({ description: 'Fats (g)', example: 12, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fats?: number;

  @ApiProperty({ description: 'Ingredients', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiProperty({ description: 'Cooking instructions', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instructions?: string[];

  @ApiProperty({ description: 'Preparation time in minutes', example: 20, required: false })
  @IsOptional()
  @IsNumber()
  prepTime?: number;

  @ApiProperty({ description: 'Cooking time in minutes', example: 15, required: false })
  @IsOptional()
  @IsNumber()
  cookTime?: number;

  @ApiProperty({ description: 'Number of servings', example: 2, required: false })
  @IsOptional()
  @IsNumber()
  servings?: number;
}

export class UpdateRecipeDto {
  @ApiProperty({ description: 'Recipe name', required: false })
  @IsOptional()
  @IsString()
  recipe_name?: string;

  @ApiProperty({ description: 'Recipe description', required: false })
  @IsOptional()
  @IsString()
  recipe_description?: string;

  @ApiProperty({ description: 'Calories', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiProperty({ description: 'Protein (g)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiProperty({ description: 'Carbohydrates (g)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs?: number;

  @ApiProperty({ description: 'Fats (g)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fats?: number;

  @ApiProperty({ description: 'Ingredients', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiProperty({ description: 'Cooking instructions', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instructions?: string[];

  @ApiProperty({ description: 'Preparation time in minutes', required: false })
  @IsOptional()
  @IsNumber()
  prepTime?: number;

  @ApiProperty({ description: 'Cooking time in minutes', required: false })
  @IsOptional()
  @IsNumber()
  cookTime?: number;

  @ApiProperty({ description: 'Number of servings', required: false })
  @IsOptional()
  @IsNumber()
  servings?: number;
}

// ============================================================================
// DAILY TRACKER DTOs
// ============================================================================

export class TrackDailyMealDto {
  @ApiProperty({ description: 'Date to track', example: '2025-10-26' })
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'Total calories for the day', example: 2000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  kcal: number;

  @ApiProperty({ description: 'Total protein (g)', example: 150 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  protein: number;

  @ApiProperty({ description: 'Total carbs (g)', example: 200 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  carbs: number;

  @ApiProperty({ description: 'Total fats (g)', example: 65 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  fats: number;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateDailyMealDto {
  @ApiProperty({ description: 'Total calories for the day', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  kcal?: number;

  @ApiProperty({ description: 'Total protein (g)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiProperty({ description: 'Total carbs (g)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs?: number;

  @ApiProperty({ description: 'Total fats (g)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fats?: number;
}

// ============================================================================
// QUERY DTOs
// ============================================================================

export class MealQueryDto {
  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Meal type filter', enum: MealType, required: false })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiProperty({ description: 'Limit results', example: 30, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

export class RecipeResponseDto {
  id: string;
  recipe_name: string;
  recipe_description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  ingredients?: string[];
  instructions?: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class MealResponseDto {
  id: string;
  mealType: string;
  mealTime: Date;
  recipes: RecipeResponseDto[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class DailyNutritionDto {
  date: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: MealResponseDto[];
}

export class NutritionAnalyticsDto {
  totalDays: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFats: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatsGoal?: number;
  adherenceScore: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendations: string[];
}

export class MealPlanDto {
  userId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatsTarget: number;
  meals: {
    day: string;
    date: Date;
    meals: MealResponseDto[];
  }[];
}

// ============================================================================
// CUSTOM CALORIE ENTRY DTOs
// ============================================================================

export class CreateCustomCalorieDto {
  @ApiProperty({ description: 'Name/description of the food item', example: 'Banana' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Calories', example: 105 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  caloriesIntake: number;

  @ApiProperty({ description: 'Protein (g)', example: 1.3, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiProperty({ description: 'Carbohydrates (g)', example: 27, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs?: number;

  @ApiProperty({ description: 'Fats (g)', example: 0.4, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fats?: number;

  @ApiProperty({ description: 'Portion size', example: '1 medium', required: false })
  @IsOptional()
  @IsString()
  portion?: string;

  @ApiProperty({ description: 'Meal type', enum: MealType, required: false })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Date of consumption', required: false })
  @IsOptional()
  @IsDateString()
  consumedAt?: Date;
}

export class UpdateCustomCalorieDto {
  @ApiProperty({ description: 'Name/description of the food item', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Calories', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  caloriesIntake?: number;

  @ApiProperty({ description: 'Protein (g)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiProperty({ description: 'Carbohydrates (g)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs?: number;

  @ApiProperty({ description: 'Fats (g)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fats?: number;

  @ApiProperty({ description: 'Portion size', required: false })
  @IsOptional()
  @IsString()
  portion?: string;

  @ApiProperty({ description: 'Meal type', enum: MealType, required: false })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;
}

export class CustomCalorieQueryDto {
  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Meal type filter', enum: MealType, required: false })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiProperty({ description: 'Limit results', example: 50, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CustomCalorieResponseDto {
  id: string;
  userId: string;
  name: string;
  caloriesIntake: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  portion?: string;
  mealType?: MealType;
  consumedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class DailyCustomCalorieSummaryDto {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  entries: CustomCalorieResponseDto[];
  entriesCount: number;
}
