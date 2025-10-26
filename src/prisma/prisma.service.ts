import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, CourseType, ChallengeType , GroupType} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

export const GroupTypes = {
  "Personal": GroupType.Personal,
  "Yoga": GroupType.Yoga,
  "Pilates": GroupType.Pilates,
  "GYM": GroupType.GYM,
  "CrossFit": GroupType.CrossFit,
  "Stretch": GroupType.Stretch,
  // Add other group types as needed
};

export const ChallengeTypes = {
  "Cardio": ChallengeType.Cardio,
  "Strength": ChallengeType.Strength,
  "Flexibility": ChallengeType.Flexibility,
  "Balance": ChallengeType.Balance,
  "Endurance": ChallengeType.Endurance,
  // Add other challenge types as needed
};

export const CourseTypes = {
  "Yoga": CourseType.Yoga,
  "Pilates": CourseType.Pilates,
  "GYM": CourseType.GYM,
  "CrossFit": CourseType.CrossFit,
  "Stretch": CourseType.Stretch,
  // Add other course types as needed
}
