import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotiController } from './noti.controller';
import { NotiService } from './noti.service';

import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

import * as admin from 'firebase-admin';


const serviceAccountPath = '../../serviceAccountKey.json';
const certificatePath = '../../apns-certificate.pem';
const privateKeyPath = '../../apns-private-key.pem';

@Global()
@Module({
  controllers: [NotiController],
  providers: [
    NotiService,
    PrismaService,
    AuthService,
    JwtService,
    UsersService,
    {
      provide: 'APP_FIREBASE',
      useValue: admin.initializeApp(
        {
          credential: admin.credential.cert(
            require(serviceAccountPath)
          ),
        },
        'physicue_pro',
      ),
    },
  ],
  exports: ['APP_FIREBASE'],
  imports: [AuthModule],
})
export class NotiModule {}