import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotiController } from './noti.controller';
import { NotiService } from './noti.service';
import * as admin from 'firebase-admin';

const serviceAccountPath = '../../serviceAccountKey.json';
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
            require(serviceAccountPath) as admin.ServiceAccount,
          ),
        },
        'physicue_pro',
      ),
    },
  ],
  exports: ['APP_FIREBASE'],
})
export class NotiModule {}