
import { Body, Controller, Post } from '@nestjs/common';
import { NotiService } from './noti.service';
import { SendNotificationDto } from './noti.dtos';

@Controller('noti')
export class NotiController {
  constructor(private readonly firebaseService: NotiService) {}

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
