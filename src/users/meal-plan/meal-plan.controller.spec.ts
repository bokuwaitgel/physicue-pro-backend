import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanController } from './meal-plan.controller';
import { MealPlanService } from './meal-plan.service';

describe('MealPlanController', () => {
  let controller: MealPlanController;
  let service: MealPlanService;

  const mockMealPlanService = {
    createMeal: jest.fn(),
    getMeal: jest.fn(),
    getMeals: jest.fn(),
    updateMeal: jest.fn(),
    deleteMeal: jest.fn(),
    createRecipe: jest.fn(),
    getRecipe: jest.fn(),
    getRecipes: jest.fn(),
    updateRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
    trackDailyMeal: jest.fn(),
    getDailyTracking: jest.fn(),
    getWeeklyTracking: jest.fn(),
    getMonthlyTracking: jest.fn(),
    getNutritionAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealPlanController],
      providers: [
        {
          provide: MealPlanService,
          useValue: mockMealPlanService,
        },
      ],
    }).compile();

    controller = module.get<MealPlanController>(MealPlanController);
    service = module.get<MealPlanService>(MealPlanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRecipe', () => {
    it('should create a recipe', async () => {
      const createRecipeDto = {
        recipe_name: 'Test Recipe',
        recipe_description: 'Test Description',
        calories: 350,
      };

      const mockResponse = {
        status: true,
        type: 'success',
        message: 'Recipe created successfully',
        data: { id: 'recipe123', ...createRecipeDto },
      };

      mockMealPlanService.createRecipe.mockResolvedValue(mockResponse);

      const result = await controller.createRecipe(createRecipeDto as any);

      expect(result).toEqual(mockResponse);
      expect(service.createRecipe).toHaveBeenCalledWith(createRecipeDto);
    });
  });

  describe('getNutritionAnalytics', () => {
    it('should return nutrition analytics', async () => {
      const mockRequest = { user: { userId: 'user123' } };
      const mockAnalytics = {
        totalDays: 30,
        averageCalories: 2000,
        averageProtein: 150,
        averageCarbs: 200,
        averageFats: 65,
        totalCalories: 60000,
        totalProtein: 4500,
        totalCarbs: 6000,
        totalFats: 1950,
        adherenceScore: 85,
        trend: 'stable' as const,
        recommendations: ['Keep up the good work!'],
      };

      mockMealPlanService.getNutritionAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getNutritionAnalytics(mockRequest);

      expect(result).toEqual(mockAnalytics);
      expect(service.getNutritionAnalytics).toHaveBeenCalledWith('user123');
    });
  });
});
