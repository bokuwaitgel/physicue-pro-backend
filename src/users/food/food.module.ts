import { Module } from '@nestjs/common';

import { FoodController } from './food.controller';
import { FoodService } from './food.service';

@Module({
  imports: [],
  controllers: [FoodController],
  providers: [FoodService],
})
export class CourseModule {}
