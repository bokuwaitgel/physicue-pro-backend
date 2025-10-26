import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

import { SleepController } from './sleep.controller';
import { SleepService } from './sleep.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SleepController],
  providers: [SleepService],
  exports: [SleepService],
})
export class SleepModule {}
