import { Body, Controller, Delete, Get, Post, Put, Param, UseInterceptors, UploadedFile, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import {CreateEventDto, EventLikeDto} from './event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from 'src/auth/auth.service';
import { EventService } from './event.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('event')
export class EventController {
    constructor(
        private readonly eventService: EventService,
        private readonly authService: AuthService
    ) {}

    @Post('create')
    @ApiOperation({ summary: 'Create event' })
    @ApiResponse({ status: 200, description: 'Data' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    public async createEvent(@Body() data: CreateEventDto, @Headers('Authorization') auth: string) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const creater = decoded.data.id;
        return this.eventService.createEvent(data, creater);
    }

    @Put('update/:eventId')
    @ApiOperation({ summary: 'Update event' })
    @ApiResponse({ status: 200, description: 'Data' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    public async updateEvent(@Param('eventId') eventId: string, @Body() data: CreateEventDto, @Headers('Authorization') auth: string) {
        return this.eventService.updateEvent(eventId, data);
    }

    @Get('getEvent/:eventId')
    @ApiOperation({ summary: 'Get event by id' })
    @ApiResponse({ status: 200, description: 'Data' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getEvent(@Param('eventId') eventId: string, @Headers('Authorization') auth: string) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.eventService.getEvent(eventId, userId);
    }

    @Get('getEvents/:groupId')
    @ApiOperation({ summary: 'Get all events by group id' })
    @ApiResponse({ status: 200, description: 'Data' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getEvents(@Param('groupId') groupId: string, @Headers('Authorization') auth: string) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.eventService.getEventsByGroupId(groupId, userId);
    }

    @Post('like')
    @ApiOperation({ summary: 'Like event' })
    @ApiResponse({ status: 200, description: 'Data' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    public async likeEvent(@Body() data: EventLikeDto, @Headers('Authorization') auth: string) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.eventService.likeEvent(data, userId);
    }

   


}
