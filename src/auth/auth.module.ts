import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { CourseService } from 'src/cources/course/course.service';



@Module({
  imports: [
    JwtModule.registerAsync({
    imports: [],
    useFactory: () => ({
      secret: process.env.SECRETKEY,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    }),
    inject: [],
  }),
  PassportModule.register({
    defaultStrategy: 'jwt',
    property: 'user',
    session: false,
  })],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, JwtService, PrismaService, UsersService, CourseService],
  controllers: [AuthController]
})
export class AuthModule {}
