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

    // send notificaiton to users
  async sendNotificationToUsers(
    title: string,
    body: string,
    userIds: string[],
  ): Promise<any> { 
    try {
      if (!userIds || userIds.length === 0) {
        return {
          message: 'Хэрэглэгчийн ID байхгүй байна',
        };
      }

      const users = await this.prisma.user.findMany({
        where: {
          id: { in: userIds },
          fcmToken: { not: "" },
        },
      });

      if (users.length === 0) {
        return {
          message: 'Хэрэглэгчид олдсонгүй',
        };
      }

      const tokens = users.map(user => user.fcmToken);

      await this.physicue_pro.messaging().sendEachForMulticast({
        notification: { title: title, body: body },
        data: { title: title, body: body },
        tokens: tokens,
      });

      // Save notifications to database
      for (const user of users) {
        await this.prisma.notification.create({
          data: {
            userId: user.id,
            title: title,
            body: body,
            token: user.fcmToken,
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