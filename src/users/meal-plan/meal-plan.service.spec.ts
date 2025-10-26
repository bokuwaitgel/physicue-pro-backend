import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanService } from './meal-plan.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MealPlanService', () => {
  let service: MealPlanService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    meal: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    recipe: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    mealRecipe: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    userMealTrackerDaily: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealPlanService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MealPlanService>(MealPlanService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRecipe', () => {
    it('should create a recipe successfully', async () => {
      const createRecipeDto = {
        recipe_name: 'Test Recipe',
        recipe_description: 'Test Description',
        calories: 350,
        protein: 30,
        carbs: 25,
        fats: 12,
      };

      const mockRecipe = {
        id: 'recipe123',
        ...createRecipeDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.recipe.create.mockResolvedValue(mockRecipe);

      const result = await service.createRecipe(createRecipeDto as any);

      expect(result.status).toBe(true);
      expect(result.data).toEqual(mockRecipe);
      expect(prisma.recipe.create).toHaveBeenCalledWith({
        data: createRecipeDto,
      });
    });
  });

  describe('trackDailyMeal', () => {
    it('should create a new daily tracking record', async () => {
      const trackDto = {
        userId: 'user123',
        date: new Date('2025-10-26'),
        kcal: 2000,
        protein: 150,
        carbs: 200,
        fats: 65,
      };

      const mockUser = { id: 'user123', email: 'test@example.com' };
      const mockTrackingRecord = {
        id: 'track123',
        ...trackDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userMealTrackerDaily.findFirst.mockResolvedValue(null);
      mockPrismaService.userMealTrackerDaily.create.mockResolvedValue(mockTrackingRecord);

      const result = await service.trackDailyMeal(trackDto as any);

      expect(result.status).toBe(true);
      expect(result.type).toBe('success');
      expect(prisma.userMealTrackerDaily.create).toHaveBeenCalled();
    });
  });
});
