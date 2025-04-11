import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { EventModule } from './event/event.module';

import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService,AuthService, JwtService, UsersService],
  imports: [EventModule]
})
export class GroupsModule {}
