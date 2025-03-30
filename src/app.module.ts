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
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.auth.env',
      load: [config],
    }),
    UsersModule,
    PrismaModule,
    GroupsModule,
    CourcesModule
  ],
  controllers: [AppController],
  providers: [AppService, CourcesService, AwsS3Service],
})
export class AppModule {}
