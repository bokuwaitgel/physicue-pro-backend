// firebase-notification.service.ts
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as admin from 'firebase-admin';
import * as apn from 'apn';

export enum DeviceType {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web'
}

@Injectable()
export class NotiService {
  constructor(
    @Inject('APP_FIREBASE') private readonly physicue_pro: admin.app.App,
    private readonly prisma: PrismaService,
  ) {}

  private detectDeviceType(token: string): DeviceType {
    // APNS tokens are 64 characters hex
    if (/^[a-fA-F0-9]{64}$/.test(token)) {
      return DeviceType.IOS;
    }
    
    // FCM tokens are longer and contain special characters
    if (token.length > 100 && token.includes(':')) {
      return DeviceType.ANDROID; // or WEB
    }
    
    // Default to Android for FCM-like tokens
    return DeviceType.ANDROID;
  }

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

        // Save notification to database
        if (user) {
          //detect token apn or fcm

         
          // Send FCM notification
          await this.physicue_pro.messaging().send({
            notification: { title: title, body: body },
            data: { title: title, body: body },
            token: token,
          });
  
          
          
          // await this.prisma.notification.create({
          //   data: {
          //     userId: user.id,
          //     title: title,
          //     body: body,
          //     token: token,
          //   },
          // });
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
        success: true,
        type: 'success',
        code: HttpStatus.CREATED,            
        message: 'Амжилттай илгээгдлээ',
      };
    } catch (err) {
      return {
        success: false,
        type: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err.message,
      };
    }
  }

  async get_user_notifications(userId: string): Promise<any> {
    try {
      if (!userId) {
        return {
          success: false,
          type: 'error',
          code: HttpStatus.BAD_REQUEST,
          message: 'Хэрэглэгчийн ID байхгүй байна',
        };
      }

      const notifications = await this.prisma.notification.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        type: 'success',
        code: HttpStatus.OK,
        data: notifications,
      };
    } catch (err) {
      return {
        success: false,
        type: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err.message,
      };
    }
  }
    
}