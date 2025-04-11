import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import {CreateEventDto, EventLikeDto} from './event.dto';

@Injectable()
export class EventService {
    constructor(private prisma: PrismaService) {
    }

    //create event
    async createEvent(createEventDto: CreateEventDto, creater: string) {
        const { groupId, ...eventData } = createEventDto;
        const event = await this.prisma.event.create({
            data: {
                title: eventData.title,
                description: eventData.description,
                startTime: new Date(eventData.startTime),
                endTime: new Date(eventData.endTime),
                location: eventData.location,
                imageURL: eventData.imageURL,
                createdBy: creater,
                group: {
                    connect: { id: groupId },
                },
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Event created successfully',
            data: event,
            code: HttpStatus.CREATED,
        }
    }

    //update event
    async updateEvent(id: string, updateEventDto: CreateEventDto) {
        const { groupId, ...eventData } = updateEventDto;
        const event = await this.prisma.event.update({
            where: { id },
            data: {
                ...eventData,
                group: {
                    connect: { id: groupId },
                },
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Event updated successfully',
            data: event,
            code: HttpStatus.OK,
        }
    }

    //get event by id
    async getEvent(id: string, userId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });

        // get likes
        const eventLikes = await this.prisma.eventLike.findMany({
            where: { eventId: id },
        });

        // check if user liked the event
        const userLiked = eventLikes.some(like => like.userId === userId);

        return {
            success: true,
            type: 'success',
            message: 'Event fetched successfully',
            data: {
                ...event,
                liked: userLiked,
                likes: eventLikes.length,
            },
            code: HttpStatus.OK,
        };
    }

    //get events by group id
    async getEventsByGroupId(groupId: string, userId: string) {
        const events = await this.prisma.event.findMany({
            where: { groupId },
        });

        // get likes
        const eventLikes = await this.prisma.eventLike.findMany({
            where: { eventId: { in: events.map(event => event.id) } },
        });



        return {
            success: true,
            type: 'success',
            message: 'Events fetched successfully',
            data: events.map(event => ({
                ...event,
                likes: eventLikes.filter(like => like.eventId === event.id).length,
                liked: eventLikes.some(like => like.eventId === event.id && like.userId === userId),
            })),
            code: HttpStatus.OK,
        };
    }

    //event like
    async likeEvent(eventLikeDto: EventLikeDto, userId: string) {
        const { eventId } = eventLikeDto;
        //check if event already liked
        const existingLike = await this.prisma.eventLike.findFirst({
            where: {
                eventId,
                userId,
            },
        });

        //if already liked, remove like
        if (existingLike) {
            await this.prisma.eventLike.delete({
                where: {
                    id: existingLike.id,
                },
            });
            return {
                success: true,
                type: 'success',
                message: 'Event unliked successfully',
                code: HttpStatus.OK,
            }
        }

        const event = await this.prisma.eventLike.create({
            data: {
                eventId,
                userId,
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Event liked successfully',
            code: HttpStatus.OK,
        }
    }


}
