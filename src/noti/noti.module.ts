import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotiController } from './noti.controller';
import { NotiService } from './noti.service';
import * as admin from 'firebase-admin';
import * as apn from 'apn';

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
    {
      // Provide the Firebase app instance for APNs
      provide: 'APP_FIREBASE_APNS',
      useValue: new apn.Provider({
        token: {
          key: require(privateKeyPath), // Path to your APNs private key
          keyId: '3XQW4TF383', // Replace with your actual key ID
          teamId: 'G4894Q4JUR', // Replace with your actual team ID
        },
        production: false, // Set to true if using production APNs
      }),

    }
  ],
  exports: ['APP_FIREBASE'],
})
export class NotiModule {}