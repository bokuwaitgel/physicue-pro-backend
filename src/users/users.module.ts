import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BodyController } from './body/body.controller';
import { BodyService } from './body/body.service';
import { FoodController } from './food/food.controller';
import { FoodService } from './food/food.service';
import { SleepController } from './sleep/sleep.controller';
import { SleepService } from './sleep/sleep.service';
import { WaterController } from './water/water.controller';
import { WaterService } from './water/water.service';


@Module({
  controllers: [UsersController, BodyController, FoodController, SleepController, WaterController],
  providers: [UsersService, BodyService, FoodService, SleepService, WaterService],
})
export class UsersModule {}
