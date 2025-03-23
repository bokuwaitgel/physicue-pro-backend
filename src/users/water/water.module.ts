import { Module } from '@nestjs/common';

import { WaterController } from './water.controller';
import { WaterService } from './water.service';

@Module({
  imports: [],
  controllers: [WaterController],
  providers: [WaterService],
})
export class CourseModule {}
