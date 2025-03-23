import { Module } from '@nestjs/common';

import { SleepController } from './sleep.controller';
import { SleepService } from './sleep.service';

@Module({
  imports: [],
  controllers: [SleepController],
  providers: [SleepService],
})
export class CourseModule {}
