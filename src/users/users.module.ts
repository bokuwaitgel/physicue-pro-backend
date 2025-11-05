import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BodyController } from './body/body.controller';
import { BodyService } from './body/body.service';
import { SleepController } from './sleep/sleep.controller';
import { SleepService } from './sleep/sleep.service';
import { WaterController } from './water/water.controller';
import { WaterService } from './water/water.service';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { StreakCounterModule } from './streak-counter/streak-counter.module';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthController } from 'src/auth/auth.controller';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt.strategy';


@Module({
  imports: [AuthModule, MealPlanModule, StreakCounterModule],
  controllers: [UsersController, BodyController, SleepController, WaterController, AuthController],
  providers: [UsersService, BodyService, SleepService, WaterService, AuthService, JwtService, JwtStrategy],
})
export class UsersModule {}
