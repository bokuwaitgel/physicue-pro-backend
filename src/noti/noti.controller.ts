
import { Body, Controller, Post } from '@nestjs/common';
import { FirebaseNotificationService } from './noti.service';
import { SendNotificationDto } from './noti.dtos';

@Controller('noti')
export class NotiController {
  constructor(private readonly firebaseService: FirebaseNotificationService) {}

  @Post('send')
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
  ): Promise<void> {
    return await this.firebaseService.sendNotification(
      sendNotificationDto.token,
      sendNotificationDto.type = 'Physicue Pro',
      sendNotificationDto.message,
    );
  }
}
