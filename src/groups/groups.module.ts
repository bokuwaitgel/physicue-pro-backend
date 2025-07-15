import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { EventModule } from './event/event.module';

import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { NotiService } from 'src/noti/noti.service';
import { PostController } from './post/post.controller';
import { PostModule } from './post/post.module';

@Module({
  controllers: [GroupsController, PostController],
  providers: [GroupsService, AuthService, JwtService, UsersService, NotiService],
  imports: [EventModule, PostModule]
})
export class GroupsModule {}
