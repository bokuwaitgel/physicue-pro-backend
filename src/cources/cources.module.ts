import { Module } from '@nestjs/common';
import { CourcesController } from './cources.controller';

import { CourseController } from './course/course.controller';
import { CourseService } from './course/course.service';
import { ExerciseController } from './exercise/exercise.controller';
import { ExerciseService } from './exercise/exercise.service';
import { SchedulerController } from './scheduler/scheduler.controller';
import { SchedulerService } from './scheduler/scheduler.service';
import { ExerciseProgressModule } from './exercise-progress/exercise-progress.module';

import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt.strategy';

import { AuthModule } from 'src/auth/auth.module';
import { AuthController } from 'src/auth/auth.controller';
import { UsersService } from 'src/users/users.service';
import { NotiService } from 'src/noti/noti.service';

@Module({
  imports: [AuthModule, ExerciseProgressModule],
  controllers: [CourcesController, CourseController, ExerciseController, SchedulerController, AuthController],
  providers: [CourseService, ExerciseService, SchedulerService, AuthService, JwtService, JwtStrategy, UsersService, NotiService],
})
export class CourcesModule {}
