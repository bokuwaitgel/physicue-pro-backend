import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { NotiController } from 'src/noti/noti.controller';  
import { NotiService } from 'src/noti/noti.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PaymentController, NotiController],
  providers: [PaymentService, NotiService, PrismaService, AuthService, JwtService, UsersService],
})
export class PaymentModule {}