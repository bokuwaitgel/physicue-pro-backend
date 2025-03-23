import { Module } from '@nestjs/common';
import { CourcesController } from './cources.controller';

import { CourseController } from './course/course.controller';
import { CourseService } from './course/course.service';
import { ExerciseController } from './exercise/exercise.controller';
import { ExerciseService } from './exercise/exercise.service';
import { SchedulerController } from './scheduler/scheduler.controller';
import { SchedulerService } from './scheduler/scheduler.service';





@Module({
  controllers: [CourcesController, CourseController, ExerciseController, SchedulerController],
  providers: [CourseService, ExerciseService, SchedulerService],
})
export class CourcesModule {}
