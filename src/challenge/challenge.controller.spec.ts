import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';

describe('ChallengeController', () => {
  let controller: ChallengeController;
  let service: ChallengeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengeController],
      providers: [
        {
          provide: ChallengeService,
          useValue: {
            createChallenge: jest.fn(),
            getAllChallenges: jest.fn(),
            getChallengeById: jest.fn(),
            updateChallenge: jest.fn(),
            deleteChallenge: jest.fn(),
            enrollInChallenge: jest.fn(),
            getUserEnrollments: jest.fn(),
            updateChallengeProgress: jest.fn(),
            cancelEnrollment: jest.fn(),
            getLeaderboard: jest.fn(),
            getUserStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChallengeController>(ChallengeController);
    service = module.get<ChallengeService>(ChallengeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllChallenges', () => {
    it('should return all challenges', async () => {
      const mockChallenges = [
        {
          id: '1',
          title: 'Test Challenge',
          description: 'Test',
          imageUrl: '',
          duration: 30,
          point: 100,
          type: ['Cardio'],
          status: 'active',
          goal: 'Test goal',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'getAllChallenges').mockResolvedValue(mockChallenges as any);

      const result = await controller.getAllChallenges();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockChallenges);
      expect(service.getAllChallenges).toHaveBeenCalled();
    });
  });
});
