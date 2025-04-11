import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { CourcesService } from './cources/cources.service';
import { CourcesModule } from './cources/cources.module';
import { AwsS3Service } from './s3.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './auth/auth.controller';
import { EventController } from './groups/event/event.controller';
import { EventService } from './groups/event/event.service';
import { EventModule } from './groups/event/event.module';


import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [config],
    }),
    UsersModule,
    PrismaModule,
    GroupsModule,
    CourcesModule,
    AuthModule,
    EventModule,  
  ],
  controllers: [AppController, AuthController, EventController],
  providers: [AppService, CourcesService, AwsS3Service, AuthService, JwtService, JwtStrategy, JwtAuthGuard, UsersService, PrismaService, EventService],
})
export class AppModule {}
