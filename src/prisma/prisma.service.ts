import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, CourseType } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

export const CourseTypes = {
  "Yoga": CourseType.Yoga,
  "Pilates": CourseType.Pilates,
  "GYM": CourseType.GYM,
  "CrossFit": CourseType.CrossFit,
  "Stretch": CourseType.Stretch,
  // Add other course types as needed
}
