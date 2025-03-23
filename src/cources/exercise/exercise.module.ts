import { Module } from '@nestjs/common';

import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';

@Module({
  imports: [],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class TodoModule {}
