import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotiController } from './noti.controller';
import { NotiService } from './noti.service';
import * as admin from 'firebase-admin';
import * as apn from 'apn';
import * as fs from 'fs';

const serviceAccountPath = '../../serviceAccountKey.json';
const certificatePath = '../../apns-certificate.pem';
const privateKeyPath = '../../apns-private-key.pem';

@Global()
@Module({
  controllers: [NotiController],
  providers: [
    NotiService,
    PrismaService,
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
})
export class NotiModule {}