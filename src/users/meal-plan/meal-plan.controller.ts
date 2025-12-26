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
  UploadedFile,
  HttpCode,
  HttpStatus,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MealPlanService } from './meal-plan.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthService } from '../../auth/auth.service';
import {
  CreateMealDto,
  UpdateMealDto,
  TrackDailyMealDto,
  UpdateDailyMealDto,
  MealQueryDto,
  CreateCustomCalorieDto,
  UpdateCustomCalorieDto,
  CustomCalorieQueryDto,
  CreateIngredientDto,
  UpdateIngredientDto,
  CreateMealPlanDto,
  UpdateMealPlanDto,
} from './meal-plan.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Get('meals/created-by-me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get meals created by authenticated user' })
  async getMyMeals(@Headers('Authorization') auth: string, @Query() query: MealQueryDto) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.getMealByCreatedBy(decoded.data.id);
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

  // ============================================================================
  // INGREDIENT ENDPOINTS
  // ============================================================================

  @Post('ingredient')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add ingredient to a meal' })
  @ApiResponse({ status: 201, description: 'Ingredient added successfully' })
  @ApiResponse({ status: 404, description: 'Meal not found' })
  async createIngredient(@Body() createIngredientDto: CreateIngredientDto, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.createIngredient(createIngredientDto);
  }

  @Get('meal/:mealId/ingredients')
  @ApiOperation({ summary: 'Get all ingredients for a meal' })
  @ApiResponse({ status: 200, description: 'Ingredients retrieved successfully' })
  async getMealIngredients(@Param('mealId') mealId: string) {
    return this.mealPlanService.getMealIngredients(mealId);
  }

  @Put('ingredient/:ingredientId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an ingredient' })
  @ApiResponse({ status: 200, description: 'Ingredient updated successfully' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async updateIngredient(
    @Param('ingredientId') ingredientId: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @Headers('Authorization') auth: string
  ) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.updateIngredient(ingredientId, updateIngredientDto);
  }

  @Delete('ingredient/:ingredientId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an ingredient' })
  @ApiResponse({ status: 200, description: 'Ingredient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  async deleteIngredient(@Param('ingredientId') ingredientId: string, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.deleteIngredient(ingredientId);
  }

  // ============================================================================
  // MEAL PLAN ENDPOINTS (Course Meal Plans)
  // ============================================================================

  @Post('meal-plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a meal plan entry (assign meal to course day)' })
  @ApiResponse({ status: 201, description: 'Meal plan created successfully' })
  async createMealPlan(@Body() createMealPlanDto: CreateMealPlanDto, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.createMealPlan(createMealPlanDto);
  }

  @Get('meal-plan/course/:courseId')
  @ApiOperation({ summary: 'Get meal plan for a course' })
  @ApiResponse({ status: 200, description: 'Meal plan retrieved successfully' })
  async getCourseMealPlan(@Param('courseId') courseId: string) {
    return this.mealPlanService.getCourseMealPlan(courseId);
  }

  @Get('meal-plan/course/:courseId/day/:day')
  @ApiOperation({ summary: 'Get meals for a specific day in a course' })
  @ApiResponse({ status: 200, description: 'Meals retrieved successfully' })
  async getCourseDayMeals(@Param('courseId') courseId: string, @Param('day') day: string) {
    return this.mealPlanService.getCourseDayMeals(courseId, parseInt(day));
  }

  @Put('meal-plan/:mealPlanId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a meal plan entry' })
  @ApiResponse({ status: 200, description: 'Meal plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Meal plan not found' })
  async updateMealPlan(
    @Param('mealPlanId') mealPlanId: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
    @Headers('Authorization') auth: string
  ) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.updateMealPlan(mealPlanId, updateMealPlanDto);
  }

  @Delete('meal-plan/:mealPlanId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a meal plan entry' })
  @ApiResponse({ status: 200, description: 'Meal plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Meal plan not found' })
  async deleteMealPlan(@Param('mealPlanId') mealPlanId: string, @Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    return this.mealPlanService.deleteMealPlan(mealPlanId);
  }


  @Post('image-upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMealImage(
    @UploadedFile() file: Express.Multer.File,
    @Headers('Authorization') auth: string
  ) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    const userId = decoded.data.id;
    return this.mealPlanService.uploadMealImage(userId, file);
  }

  @Get('image-meals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get meals added via image upload' })
  async getImageUploadedMeals(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    const userId = decoded.data.id;
    return this.mealPlanService.getMealImageAnalysisHistory(userId);
  }

}
