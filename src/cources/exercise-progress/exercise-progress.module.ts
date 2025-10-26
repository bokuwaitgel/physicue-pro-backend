import { Module } from '@nestjs/common';
import { ExerciseProgressController } from './exercise-progress.controller';
import { ExerciseProgressService } from './exercise-progress.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExerciseProgressController],
  providers: [ExerciseProgressService],
  exports: [ExerciseProgressService],
})
export class ExerciseProgressModule {}
