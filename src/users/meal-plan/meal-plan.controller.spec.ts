import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanController } from './meal-plan.controller';
import { MealPlanService } from './meal-plan.service';
import { AuthService } from '../../auth/auth.service';
import { MealType } from './meal-plan.dto';

describe('MealPlanController', () => {
  let controller: MealPlanController;
  let service: MealPlanService;
  let authService: AuthService;

  const mockMealPlanService = {
    createMeal: jest.fn(),
    getMeal: jest.fn(),
    getMeals: jest.fn(),
    updateMeal: jest.fn(),
    deleteMeal: jest.fn(),
    trackDailyMeal: jest.fn(),
    getDailyTracking: jest.fn(),
    getWeeklyTracking: jest.fn(),
    getMonthlyTracking: jest.fn(),
    getNutritionAnalytics: jest.fn(),
    addCustomCalorie: jest.fn(),
    getCustomCalorieEntry: jest.fn(),
    getCustomCalorieEntries: jest.fn(),
    getDailyCustomCalorieSummary: jest.fn(),
    getWeeklyCustomCalorieSummary: jest.fn(),
    updateCustomCalorie: jest.fn(),
    deleteCustomCalorie: jest.fn(),
    getDailyTrackingByUserId: jest.fn(),
    createIngredient: jest.fn(),
    getMealIngredients: jest.fn(),
    updateIngredient: jest.fn(),
    deleteIngredient: jest.fn(),
    createMealPlan: jest.fn(),
    getCourseMealPlan: jest.fn(),
    getCourseDayMeals: jest.fn(),
    updateMealPlan: jest.fn(),
    deleteMealPlan: jest.fn(),
  };

  const mockAuthService = {
    verifyToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealPlanController],
      providers: [
        {
          provide: MealPlanService,
          useValue: mockMealPlanService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<MealPlanController>(MealPlanController);
    service = module.get<MealPlanService>(MealPlanService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMeal', () => {
    it('should create a meal for the authenticated user', async () => {
      const createMealDto = {
        name: 'Test Meal',
        image: 'https://example.com/meal.jpg',
        description: 'Test meal description',
  type: MealType.BREAKFAST,
      };

      const mockResponse = {
        status: true,
        type: 'success',
        message: 'Meal created successfully',
        data: {
          id: 'meal123',
          ...createMealDto,
          createdAt: new Date(),
          updatedAt: new Date(),
          Ingredient: [],
        },
      };

      mockAuthService.verifyToken.mockResolvedValue({ code: 200, data: { id: 'user123' } });
      mockMealPlanService.createMeal.mockResolvedValue(mockResponse);

      const result = await controller.createMeal(createMealDto as any, 'Bearer token');

      expect(result).toEqual(mockResponse);
      expect(authService.verifyToken).toHaveBeenCalledWith({ token: 'Bearer token' });
      expect(service.createMeal).toHaveBeenCalledWith(createMealDto, 'user123');
    });
  });

  describe('getNutritionAnalytics', () => {
    it('should return nutrition analytics', async () => {
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

      mockAuthService.verifyToken.mockResolvedValue({ code: 200, data: { id: 'user123' } });
      mockMealPlanService.getNutritionAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getNutritionAnalytics('Bearer token');

      expect(result).toEqual(mockAnalytics);
      expect(authService.verifyToken).toHaveBeenCalledWith({ token: 'Bearer token' });
      expect(service.getNutritionAnalytics).toHaveBeenCalledWith('user123');
    });
  });

  describe('createIngredient', () => {
    it('should create ingredient for a meal', async () => {
      const createIngredientDto = {
        mealId: 'meal123',
        name: 'Chicken',
        image: 'https://example.com/chicken.jpg',
        quantity: '200g',
      };

      const mockResponse = {
        success: true,
        message: 'Ingredient created successfully',
        data: { id: 'ingredient123', ...createIngredientDto },
      };

      mockAuthService.verifyToken.mockResolvedValue({ code: 200, data: { id: 'user123' } });
      mockMealPlanService.createIngredient.mockResolvedValue(mockResponse);

      const result = await controller.createIngredient(createIngredientDto as any, 'Bearer token');

      expect(result).toEqual(mockResponse);
      expect(authService.verifyToken).toHaveBeenCalledWith({ token: 'Bearer token' });
      expect(service.createIngredient).toHaveBeenCalledWith(createIngredientDto);
    });
  });

  describe('getCourseMealPlan', () => {
    it('should return course meal plan data', async () => {
      const courseId = 'course123';
      const mockResponse = {
        success: true,
        data: [],
      };

      mockMealPlanService.getCourseMealPlan.mockResolvedValue(mockResponse);

      const result = await controller.getCourseMealPlan(courseId);

      expect(result).toEqual(mockResponse);
      expect(service.getCourseMealPlan).toHaveBeenCalledWith(courseId);
    });
  });
});
