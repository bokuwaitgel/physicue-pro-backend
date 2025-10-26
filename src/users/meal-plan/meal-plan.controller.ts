import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MealPlanService } from './meal-plan.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthService } from '../../auth/auth.service';
import {
  CreateMealDto,
  UpdateMealDto,
  CreateRecipeDto,
  UpdateRecipeDto,
  TrackDailyMealDto,
  UpdateDailyMealDto,
  MealQueryDto,
  CreateCustomCalorieDto,
  UpdateCustomCalorieDto,
  CustomCalorieQueryDto,
} from './meal-plan.dto';

@ApiTags('meal-plan')
@Controller('meal-plan')
export class MealPlanController {
  constructor(
    private readonly mealPlanService: MealPlanService,
    private readonly authService: AuthService
  ) {}

  // ============================================================================
  // MEAL ENDPOINTS
  // ============================================================================

  @Post('meal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new meal' })
  @ApiResponse({ status: 201, description: 'Meal created successfully' })
  async createMeal(@Body() createMealDto: CreateMealDto, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.createMeal(createMealDto, decoded.data.id);
  }

  @Get('meal/:mealId')
  @ApiOperation({ summary: 'Get meal by ID' })
  @ApiResponse({ status: 200, description: 'Meal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  async getMeal(@Param('mealId') mealId: string) {
    return this.mealPlanService.getMeal(mealId);
  }

  @Get('meals')
  @ApiOperation({ summary: 'Get all meals with optional filters' })
  @ApiResponse({ status: 200, description: 'Meals retrieved successfully' })
  async getMeals(@Query() query: MealQueryDto) {
    return this.mealPlanService.getMeals(query);
  }

  @Put('meal/:mealId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a meal' })
  @ApiResponse({ status: 200, description: 'Meal updated successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  async updateMeal(@Param('mealId') mealId: string, @Body() updateMealDto: UpdateMealDto) {
    return this.mealPlanService.updateMeal(mealId, updateMealDto);
  }

  @Delete('meal/:mealId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a meal' })
  @ApiResponse({ status: 200, description: 'Meal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  async deleteMeal(@Param('mealId') mealId: string) {
    return this.mealPlanService.deleteMeal(mealId);
  }

  // ============================================================================
  // RECIPE ENDPOINTS
  // ============================================================================

  @Post('recipe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new recipe' })
  @ApiResponse({ status: 201, description: 'Recipe created successfully' })
  async createRecipe(@Body() createRecipeDto: CreateRecipeDto) {
    return this.mealPlanService.createRecipe(createRecipeDto);
  }

  @Get('recipe/:recipeId')
  @ApiOperation({ summary: 'Get recipe by ID' })
  @ApiResponse({ status: 200, description: 'Recipe retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  async getRecipe(@Param('recipeId') recipeId: string) {
    return this.mealPlanService.getRecipe(recipeId);
  }

  @Get('recipes')
  @ApiOperation({ summary: 'Get all recipes' })
  @ApiResponse({ status: 200, description: 'Recipes retrieved successfully' })
  async getRecipes(@Query('limit') limit?: number) {
    return this.mealPlanService.getRecipes(limit);
  }

  @Put('recipe/:recipeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a recipe' })
  @ApiResponse({ status: 200, description: 'Recipe updated successfully' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  async updateRecipe(
    @Param('recipeId') recipeId: string,
    @Body() updateRecipeDto: UpdateRecipeDto
  ) {
    return this.mealPlanService.updateRecipe(recipeId, updateRecipeDto);
  }

  @Delete('recipe/:recipeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiResponse({ status: 200, description: 'Recipe deleted successfully' })
  @ApiResponse({ status: 400, description: 'Recipe is used in meals' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  async deleteRecipe(@Param('recipeId') recipeId: string) {
    return this.mealPlanService.deleteRecipe(recipeId);
  }

  // ============================================================================
  // DAILY TRACKING ENDPOINTS
  // ============================================================================

  @Post('track-daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track daily meal nutrition' })
  @ApiResponse({ status: 201, description: 'Daily meal tracked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async trackDailyMeal(@Body() trackDailyMealDto: TrackDailyMealDto, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.trackDailyMeal(trackDailyMealDto, decoded.data.id);
  }

  @Get('tracking/daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get daily tracking for authenticated user' })
  @ApiResponse({ status: 200, description: 'Daily tracking retrieved successfully' })
  async getDailyTracking(@Headers('Authorization') auth: string, @Query('date') date?: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.getDailyTracking(decoded.data.id, date);
  }

  @Get('tracking/user/:userId/daily')
  @ApiOperation({ summary: 'Get daily tracking by user ID' })
  @ApiResponse({ status: 200, description: 'Daily tracking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getDailyTrackingByUserId(
    @Param('userId') userId: string,
    @Query('date') date?: string
  ) {
    return this.mealPlanService.getDailyTracking(userId, date);
  }

  @Get('tracking/weekly')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly nutrition summary' })
  @ApiResponse({ status: 200, description: 'Weekly summary retrieved successfully' })
  async getWeeklyTracking(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.getWeeklyTracking(decoded.data.id);
  }

  @Get('tracking/monthly')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get monthly nutrition summary' })
  @ApiResponse({ status: 200, description: 'Monthly summary retrieved successfully' })
  async getMonthlyTracking(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.getMonthlyTracking(decoded.data.id);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive nutrition analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getNutritionAnalytics(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.getNutritionAnalytics(decoded.data.id);
  }

  @Get('analytics/user')
  @ApiOperation({ summary: 'Get nutrition analytics by user ID' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getNutritionAnalyticsByUserId(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    const userId = decoded.data.id;
    return this.mealPlanService.getNutritionAnalytics(userId);
  }

  // ============================================================================
  // CUSTOM CALORIE ENTRY ENDPOINTS
  // ============================================================================

  @Post('custom-calorie')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add custom calorie entry' })
  @ApiResponse({ status: 201, description: 'Custom calorie entry added successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async addCustomCalorie(@Body() createCustomCalorieDto: CreateCustomCalorieDto, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.addCustomCalorie(createCustomCalorieDto, decoded.data.id);
  }

  @Get('custom-calorie/:entryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get custom calorie entry by ID' })
  @ApiResponse({ status: 200, description: 'Entry retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async getCustomCalorieEntry(@Param('entryId') entryId: string, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.getCustomCalorieEntry(entryId, decoded.data.id);
  }

  @Get('custom-calories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all custom calorie entries' })
  @ApiResponse({ status: 200, description: 'Entries retrieved successfully' })
  async getCustomCalorieEntries(@Headers('Authorization') auth: string, @Query() query: CustomCalorieQueryDto) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.getCustomCalorieEntries(decoded.data.id, query);
  }

  @Get('custom-calories/daily-summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get daily custom calorie summary' })
  @ApiResponse({ status: 200, description: 'Daily summary retrieved successfully' })
  async getDailyCustomCalorieSummary(@Headers('Authorization') auth: string, @Query('date') date?: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.getDailyCustomCalorieSummary(decoded.data.id, date);
  }

  @Get('custom-calories/weekly-summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly custom calorie summary' })
  @ApiResponse({ status: 200, description: 'Weekly summary retrieved successfully' })
  async getWeeklyCustomCalorieSummary(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.getWeeklyCustomCalorieSummary(decoded.data.id);
  }

  @Put('custom-calorie/:entryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update custom calorie entry' })
  @ApiResponse({ status: 200, description: 'Entry updated successfully' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async updateCustomCalorie(
    @Param('entryId') entryId: string,
    @Body() updateCustomCalorieDto: UpdateCustomCalorieDto,
    @Headers('Authorization') auth: string
  ) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.updateCustomCalorie(entryId, decoded.data.id, updateCustomCalorieDto);
  }

  @Delete('custom-calorie/:entryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete custom calorie entry' })
  @ApiResponse({ status: 200, description: 'Entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async deleteCustomCalorie(@Param('entryId') entryId: string, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.deleteCustomCalorie(entryId, decoded.data.id);
  }
}
