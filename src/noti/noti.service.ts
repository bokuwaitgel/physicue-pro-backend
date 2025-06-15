// firebase-notification.service.ts
import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseNotificationService {
  constructor(
    @Inject('APP_FIREBASE') private readonly physicue_pro: admin.app.App,
  ) {}
  async sendNotification(
    token: string,
    title: string,
    body: string
  ): Promise<any> {
      try {
        await this.physicue_pro.messaging().send({
          notification: { title: title, body: body },
          data: { title: title, body: body },
          token: token,
        });
        return {
          message: 'Амжилттай илгээгдлээ',
        };
      } catch (err) {
        return {
          message: err.message,
        };
      }
    } 
}