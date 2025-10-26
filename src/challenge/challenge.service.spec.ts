import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeService } from './challenge.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChallengeService', () => {
  let service: ChallengeService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengeService,
        {
          provide: PrismaService,
          useValue: {
            challenge: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            challengeInstruction: {
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            challengeEnrollment: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            challengePoint: {
              create: jest.fn(),
              aggregate: jest.fn(),
              groupBy: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChallengeService>(ChallengeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChallenge', () => {
    it('should create a challenge with instructions', async () => {
      const createDto = {
        title: 'Test Challenge',
        description: 'Test Description',
        duration: 30,
        point: 100,
        type: ['Cardio'],
        goal: 'Complete 30 days',
        instructions: ['Step 1', 'Step 2'],
      };

      const mockChallenge = {
        id: '1',
        ...createDto,
        imageUrl: '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        ChallengeInstruction: [
          { id: '1', instruction: 'Step 1' },
          { id: '2', instruction: 'Step 2' },
        ],
      };

      jest.spyOn(prisma.challenge, 'create').mockResolvedValue(mockChallenge as any);

      const result = await service.createChallenge(createDto as any);

      expect(result).toBeDefined();
      expect(result.title).toBe(createDto.title);
      expect(prisma.challenge.create).toHaveBeenCalled();
    });
  });

  describe('getAllChallenges', () => {
    it('should return all active challenges', async () => {
      const mockChallenges = [
        {
          id: '1',
          title: 'Challenge 1',
          description: 'Description 1',
          duration: 30,
          point: 100,
          type: ['Cardio'],
          goal: 'Goal 1',
          imageUrl: '',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          ChallengeInstruction: [],
          _count: { ChallengeEnrollment: 5 },
        },
      ];

      jest.spyOn(prisma.challenge, 'findMany').mockResolvedValue(mockChallenges as any);

      const result = await service.getAllChallenges();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(prisma.challenge.findMany).toHaveBeenCalled();
    });
  });
});
