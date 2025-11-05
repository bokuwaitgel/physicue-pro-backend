import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanService } from './meal-plan.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MealType } from './meal-plan.dto';

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
    ingredient: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    mealPlan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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

  describe('createMeal', () => {
    it('should create a meal successfully', async () => {
      const createMealDto = {
        name: 'Test Meal',
        image: 'https://example.com/meal.jpg',
        description: 'Test Description',
        type: MealType.BREAKFAST,
      };

      const mockMeal = {
        id: 'meal123',
        ...createMealDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        Ingredient: [],
      };

      mockPrismaService.meal.create.mockResolvedValue(mockMeal);

      const result = await service.createMeal(createMealDto as any);

      expect(result.status).toBe(true);
      expect(result.data).toEqual({
        id: mockMeal.id,
        name: mockMeal.name,
        image: mockMeal.image,
        description: mockMeal.description,
        type: mockMeal.type,
        createdAt: mockMeal.createdAt,
        updatedAt: mockMeal.updatedAt,
        Ingredient: [],
      });
      expect(prisma.meal.create).toHaveBeenCalledWith({
        data: {
          name: createMealDto.name,
          image: createMealDto.image,
          description: createMealDto.description,
          type: createMealDto.type,
        },
        include: {
          Ingredient: true,
        },
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
