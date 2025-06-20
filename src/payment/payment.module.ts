import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { NotiController } from 'src/noti/noti.controller';  
import { NotiService } from 'src/noti/noti.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [PaymentController, NotiController],
  providers: [PaymentService, NotiService, PrismaService],
})
export class PaymentModule {}