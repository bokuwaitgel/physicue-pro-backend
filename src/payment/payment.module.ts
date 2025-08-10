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
import { CourseController } from 'src/cources/course/course.controller';
import { CourseService } from 'src/cources/course/course.service';


@Module({
  imports: [AuthModule],
  controllers: [PaymentController, NotiController, CourseController],
  providers: [PaymentService, NotiService, PrismaService, AuthService, JwtService, UsersService, CourseService],
  exports: [PaymentService, NotiService, PrismaService, AuthService, UsersService, CourseService],
})
export class PaymentModule {}