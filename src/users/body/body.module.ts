import { Module } from '@nestjs/common';

import { BodyController } from './body.controller';
import { BodyService } from './body.service';

@Module({
  imports: [],
  controllers: [BodyController],
  providers: [BodyService],
})
export class CourseModule {}
