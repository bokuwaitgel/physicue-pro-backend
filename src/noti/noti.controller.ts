
import { Body, Controller, Get, Post, UseGuards, Headers } from '@nestjs/common';
import { NotiService } from './noti.service';
import { SendNotificationDto } from './noti.dtos';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 
import { AuthService } from 'src/auth/auth.service';

@Controller('noti')
export class NotiController {
  constructor(
    private readonly firebaseService: NotiService,
    private readonly authService: AuthService,
  ) {}

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

  @Get('notifications')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Headers('Authorization') auth: string) {
    const decoded = await this.authService.verifyToken({ token: auth });
    if (decoded.code != 200) {
      return decoded;
    }
    const userId = decoded.data.id;

    return this.firebaseService.get_user_notifications(userId);
  }
}
