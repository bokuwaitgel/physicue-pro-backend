import { Module } from '@nestjs/common';
import { StreakCounterController } from './streak-counter.controller';
import { StreakCounterService } from './streak-counter.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StreakCounterController],
  providers: [StreakCounterService],
  exports: [StreakCounterService],
})
export class StreakCounterModule {}
