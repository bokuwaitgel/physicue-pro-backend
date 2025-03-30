import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsS3Service } from 'src/s3.service';
import { CreateGroupDto,UpdateGroupDto, CreateEventDto, CreateEventCommentDto, GroupMemberDto, GroupCourseDto } from './group.dto';
import { stat } from 'fs';

@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService) {}

    async createGroup(data: CreateGroupDto) {
        //check if teacher exists
        const teacher = await this.prisma.teacher.findUnique({
            where: {
                id: data.adminId,
            },
        });
        if (!teacher) {
            return {
                success: false,
                type: 'error',
                message: 'Teacher not found',
                code: HttpStatus.NOT_FOUND,
            }
        }
        
        const result = await this.prisma.group.create({
            data: {
                name: data.name,
                description: data.description,
                bannerImage: data.bannerImage,
                requirements: data.requirements,
                admin: {
                    connect: {
                        id: data.adminId,
                    }
                }
            }
        });

        return {
            success: true,
            type: 'success',
            message: 'Group created',
            data: result,
            code: HttpStatus.CREATED,
        }
    }

    async createEvent(data: CreateEventDto) {
        //check if group exists
        const group = await this.prisma.group.findUnique({
            where: {
                id: data.groupId,
            },
        });
        if (!group) {
            return {
                success: false,
                type: 'error',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        try {
            const result = await this.prisma.event.create({
                data: {
                    title: data.title,
                    description: data.description,
                    location: data.location,
                    imageURL: data.image,
                    status: data.status,
                    startTime: new Date(data.startDate),
                    endTime: new Date(data.endDate),
                    createdBy: data.createdBy,
                    group: {
                        connect: {
                            id: data.groupId,
                        }
                    }
                }
            });
    
            return {
                success: true,
                type: 'success',
                message: 'Event created',
                data: result,
                code: HttpStatus.CREATED,
            }
        } catch (error) {
            return {
                success: false,
                type: 'error',
                message: error.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            }
        }
    }

    async createEventComment(data: CreateEventCommentDto) {
        //check if event exists
        const event = await this.prisma.event.findUnique({
            where: {
                id: data.eventId,
            },
        });
        if (!event) {
            return {
                success: false,
                type: 'error',
                message: 'Event not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: data.userId,
            },
        });
        if (!user) {
            return {
                success: false,
                type: 'error',
                message: 'User not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        try {
            const result = await this.prisma.eventComment.create({
                data: {
                    comment: data.comment,
                    user: {
                        connect: {
                            id: data.userId,
                        }
                    },
                    event: {
                        connect: {
                            id: data.eventId,
                        }
                    }
                }
            });
    
            return {
                success: true,
                type: 'success',
                message: 'Comment created',
                data: result,
                code: HttpStatus.CREATED,
            }
        } catch (error) {
            return {
                success: false,
                type: 'error',
                message: error.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            }
        }
    }

    async addGroupMember(data: GroupMemberDto) {
        //check if group exists
        const group = await this.prisma.group.findUnique({
            where: {
                id: data.groupId,
            },
        });
        if (!group) {
            return {
                success: false,
                type: 'error',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: data.userId,
            },
        });
        if (!user) {
            return {
                success: false,
                type: 'error',
                message: 'User not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        try {
            const result = await this.prisma.groupMembers.create({
                data: {
                    status: data.status,
                    user: {
                        connect: {
                            id: data.userId,
                        }
                    },
                    group: {
                        connect: {
                            id: data.groupId,
                        }
                    }
                }
            });
    
            return {
                success: true,
                type: 'success',
                message: 'Group member added',
                data: result,
                code: HttpStatus.CREATED,
            }
        } catch (error) {
            return {
                success: false,
                type: 'error',
                message: error.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            }
        }
    }

    async updateGroup (id: string, data: UpdateGroupDto) {
        //check if group exists
        const group = await this.prisma.group.findUnique({
            where: {
                id,
            },
        });
        if (!group) {
            return {
                success: false,
                type: 'error',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const result = await this.prisma.group.update({
            where: { id },
            data,
        });

        return {
            success: true,
            type: 'success',
            message: 'Group updated',
            data: result,
            code: HttpStatus.OK,
        }
    }

    async updateEvent (id: string, data: CreateEventDto) {
        //check if event exists
        const event = await this.prisma.event.findUnique({
            where: {
                id,
            },
        });
        if (!event) {
            return {
                success: false,
                type: 'error',
                message: 'Event not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const result = await this.prisma.event.update({
            where: { id },
            data,
        });

        return {
            success: true,
            type: 'success',
            message: 'Event updated',
            data: result,
            code: HttpStatus.OK,
        }
    }

    async updateGroupMember (id: string, data: GroupMemberDto) {
        //check if group member exists
        const groupMember = await this.prisma.groupMembers.findUnique({
            where: {
                id,
            },
        });
        if (!groupMember) {
            return {
                success: false,
                type: 'error',
                message: 'Group member not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const result = await this.prisma.groupMembers.update({
            where: { id },
            data,
        });

        return {
            success: true,
            type: 'success',
            message: 'Group member updated',
            data: result,
            code: HttpStatus.OK,
        }
    }

    async getGroups(teacherId: string) {
        //check if teacher exists
        const teacher = await this.prisma.teacher.findUnique({
            where: {
                id: teacherId,
            },
        });
        if (!teacher) {
            return {
                success: false,
                type: 'error',
                message: 'Teacher not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const groups = await this.prisma.group.findMany({
            where: {
                adminId: teacherId,
            },
        });

        return {
            success: true,
            type: 'success',
            message: 'Groups fetched',
            data: groups,
            code: HttpStatus.OK,
        }
    }

    async getGroupMembers(groupId: string) {
        //check if group exists
        const group = await this.prisma.group.findUnique({
            where: {
                id: groupId,
            },
        });
        if (!group) {
            return {
                success: false,
                type: 'error',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const members = await this.prisma.groupMembers.findMany({
            where: {
                groupId,
            },
        });

        return {
            success: true,
            type: 'success',
            message: 'Group members fetched',
            data: members,
            code: HttpStatus.OK,
        }
    }


    async addCourseToGroup(data: GroupCourseDto) {
        //check in groupCourses if course already exists
        const groupCourse = await this.prisma.groupCourses.findFirst({
            where: {
                groupId: data.groupId,
                courseId: data.courseId,
            },
        });

        if (groupCourse) {
            return {
                success: false,
                type: 'error',
                message: 'Course already exists in group',
                code: HttpStatus.CONFLICT,
            }
        }

        //check if group exists
        const group = await this.prisma.group.findUnique({
            where: {
                id: data.groupId,
            },
        });
        if (!group) {
            return {
                success: false,
                type: 'error',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const course = await this.prisma.courses.findUnique({
            where: {
                id: data.courseId,
            },
        });
        if (!course) {
            return {
                success: false,
                type: 'error',
                message: 'Course not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        try {
            const result = await this.prisma.groupCourses.create({
                data: {
                    status: data.status,
                    course: {
                        connect: {
                            id: data.courseId,
                        }
                    },
                    group: {
                        connect: {
                            id: data.groupId,
                        }
                    }
                }
            });
    
            return {
                success: true,
                type: 'success',
                message: 'Course added to group',
                data: result,
                code: HttpStatus.CREATED,
            }
        } catch (error) {
            return {
                success: false,
                type: 'error',
                message: error.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            }
        }
    }
    
    async getGroupCourses(groupId: string) {
        //check if group exists
        const group = await this.prisma.group.findUnique({
            where: {
                id: groupId,
            },
        });
        if (!group) {
            return {
                success: false,
                type: 'error',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const courses = await this.prisma.groupCourses.findMany({
            where: {
                groupId,
            },
        });

        const courseIds = courses.map(course => course.courseId);

        const course_data = await this.prisma.courses.findMany({
            where: {
                id: {
                    in: courseIds,
                }
            },
        });

        return {
            success: true,
            type: 'success',
            message: 'Group courses fetched',
            data: course_data,
            code: HttpStatus.OK,
        }
    }

    async getGroup(){
        const groups = await this.prisma.group.findMany( );
        return {
            success: true,
            type: 'success',
            message: 'Groups fetched',
            data: groups,
            code: HttpStatus.OK,
        }
    }

    async getGroupById(groupId: string) {
        const group = await this.prisma.group.findUnique({
            where: {
                id: groupId,
            },
        });

        if (!group) {
            return {
                success: false,
                type: 'error',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const groupCourses = await this.prisma.groupCourses.findMany({
            where: {
                groupId,
            },
        });

        return {
            success: true,
            type: 'success',
            message: 'Group fetched',
            data: {
                ...group,
                courses: groupCourses,
            },
            code: HttpStatus.OK,
        }
    }

    async uploadBannerImage(groupId: string, file: Express.Multer.File) {
        const s3 = new AwsS3Service();
        const group = this.prisma.group.findUnique({
            where: {
                id: groupId,
            }
        });
        if (!group) {
            return {
                success: false,
                type: 'failed',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        try{
            const result = await s3.uploadFile(file);
            const updatedGroup = await this.prisma.group.update({
                where: { id: groupId },
                data: {
                    bannerImage: result,
                }
            });

            return {
                success: true,
                type: 'success',
                message: 'Banner image uploaded',
                data: updatedGroup,
                code: HttpStatus.OK,
            }
        }
        catch(e){
            return {
                success: false,
                type: 'error',
                message: e.message,
                code: HttpStatus.BAD_REQUEST,
            }
        }
    }

}
