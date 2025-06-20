// firebase-notification.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class NotiService {
  constructor(
    @Inject('APP_FIREBASE') private readonly physicue_pro: admin.app.App,
    private readonly prisma: PrismaService,
  ) {}
  async sendNotification(
    token: string,
    title: string,
    body: string
  ): Promise<any> {
      try {
        if (!token) {
          return {
            message: 'Токен байхгүй байна',
          };
        }
        //find userId by token
        const user = await this.prisma.user.findFirst({
          where: {
            fcmToken: token,
          },
        });

        await this.physicue_pro.messaging().send({
          notification: { title: title, body: body },
          data: { title: title, body: body },
          token: token,
        });

        // Save notification to database
        if (user) {
          await this.prisma.notification.create({
            data: {
              userId: user.id,
              title: title,
              body: body,
              token: token,
            },
          });
        }

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