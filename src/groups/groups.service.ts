import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupType } from '@prisma/client';
import { AwsS3Service } from 'src/s3.service';
import { NotiService } from 'src/noti/noti.service';
import { CreateGroupDto ,UpdateGroupDto, CreateEventDto, CreateEventCommentDto, GroupMemberDto, GroupCourseDto } from './group.dto';
import { map } from 'rxjs';

@Injectable()
export class GroupsService {
    constructor(
        private prisma: PrismaService,
        private notiService: NotiService,
    ) {}

    async createGroup(data: CreateGroupDto, userId: string) {
        //check if teacher exists
        const teacher = await this.prisma.teacher.findFirst({
            where: {
                userId: userId,
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

        const group_count = await this.prisma.group.findMany({
            where: {
                adminId: teacher.id
            }
        })

        if (group_count.length >= teacher.groupLimit){
            return {
                success: false,
                type: 'limit',
                message: 'Group limit reached',
                code: HttpStatus.FORBIDDEN,  
            }
        }
        
        const result = await this.prisma.group.create({
            data: {
                name: data.name,
                admin: {
                    connect: {
                        id: teacher.id,
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

            // send Notification to group members
            try {
                const groupMembers = await this.prisma.groupMembers.findMany({
                    where: {
                        groupId: data.groupId,
                    },
                });
                const userIds = groupMembers.map(member => member.userId);
                if (userIds.length > 0) {
                    await this.notiService.sendNotificationToUsers(
                        'Physicue Pro',
                        `${group.name}-д шинэ Event нэмэгдлээ: ${data.title}`,
                        userIds,
                    );
                }
            } catch (error) {
                console.error('Error sending notification:', error);
            }
    
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

            // send Notification to event creator
    
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

            // send Notification to both group admin and new member
            try {
                const groupAdmin = await this.prisma.teacher.findUnique({
                    where: {
                        id: group.adminId,
                    },
                });
                if (groupAdmin) {
                    const adminUser = await this.prisma.user.findUnique({
                        where: {
                            id: groupAdmin.userId,
                        },
                    });
                    if (adminUser && adminUser.fcmToken) {
                        await this.notiService.sendNotificationToUsers(
                            'Physicue Pro',
                            `${user.firstName} ${user.lastName} хэрэглэгч таны: ${group.name} нэгдлээ`,
                            [adminUser.id],
                        );
                    }
                    if (user.fcmToken) {
                        await this.notiService.sendNotificationToUsers(
                            'Physicue Pro',
                            `Та ${group.name} бүлэгт нэгдлээ`,
                            [user.id],
                        );
                    }
                }
            } catch (error) {
                console.error('Error sending notification:', error);
            }
    
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

    async joinGroup(groupId: string, userId: string) {
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

        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
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

        //check if user is already a member of the group
        const groupMember = await this.prisma.groupMembers.findFirst({
            where: {
                    userId: userId,
                    groupId: groupId,
            },
        });
        if (groupMember) {
            return {
                success: false,
                type: 'error',
                message: 'User is already a member of the group',
                code: HttpStatus.CONFLICT,
            }
        }

        try {
            const result = await this.prisma.groupMembers.create({
                data: {
                    status: 'active',
                    user: {
                        connect: {
                            id: userId,
                        }
                    },
                    group: {
                        connect: {
                            id: groupId,
                        }
                    }
                }
            });

            // send Notification to group admin
            try {
                const groupAdmin = await this.prisma.teacher.findUnique({
                    where: {
                        id: group.adminId,
                    },
                });
                if (groupAdmin) {
                    const adminUser = await this.prisma.user.findUnique({
                        where: {
                            id: groupAdmin.userId,
                        },
                    });
                    if (adminUser && adminUser.fcmToken) {
                        await this.notiService.sendNotificationToUsers(
                            'Physicue Pro',
                            `${user.firstName} ${user.lastName} хэрэглэгч таны: ${group.name} нэгдлээ`,
                            [adminUser.id],
                        );
                    }
                }
            } catch (error) {
                console.error('Error sending notification:', error);
            }
    
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

    async leaveGroup(groupId: string, userId: string) {
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

        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
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
            const result = await this.prisma.groupMembers.deleteMany({
                where: {
                    userId,
                    groupId,
                }
            });
            
            return {
                success: true,
                type: 'success',
                message: 'Group member removed',
                data: result,
                code: HttpStatus.OK,
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

        //string list to enum conversion
        let groupType: GroupType[] = [];
        if (data.type && Array.isArray(data.type)) {
            groupType = data.type.map(type => GroupType[String(type).trim() as keyof typeof GroupType]);
        } else if (typeof data.type === 'string') {
            groupType = (data.type as string).split(',').map(type => GroupType[type.trim() as keyof typeof GroupType]);
        }
        

        const result = await this.prisma.group.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                bannerImage: data.bannerImage,
                requirements: data.requirements,
                adminId: data.adminId,
                status: data.status,
                type: groupType, // Assuming GroupType is an enum defined in your Prisma schema
            }
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

    async getTeacherGroups(teacherId: string, userId: string) {
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

        //check user is in group
        const groupMember = await this.prisma.groupMembers.findMany({
            where: {
                userId,
            },
        });

        const groupIds = groupMember.map(group => group.groupId);

        // Fetch members for each group
        const groupsData = await Promise.all(groups.map(async group => {
            const isMember = groupIds.includes(group.id);
            let members = await this.prisma.groupMembers.findMany({
                where: { groupId: group.id }
            });
            if (!members) {
                members = [];
            }

            const membersCount = members.length;
            
            const members_profile = await this.prisma.user.findMany({
                where: {
                    id: {
                        in: members.map(member => member.userId),
                    }
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    facebookAcc: true,
                    instagramAcc: true,
                    address: true,
                    mobile: true,
                    email: true,
                }
            });

            return {
                ...group,
                is_member: isMember,
                members: membersCount,
                members_profile: members_profile,
            }
        }))

        return {
            success: true,
            type: 'success',
            message: 'Groups fetched',
            data: groupsData,
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

            // send Notification to group members
            try {
                const groupMembers = await this.prisma.groupMembers.findMany({
                where: {
                    groupId: data.groupId,
                    },
                });
                const userIds = groupMembers.map(member => member.userId);
                if (userIds.length > 0) {
                    await this.notiService.sendNotificationToUsers(
                        'Physicue Pro',
                        `${group.name}-д шинэ курс нэмэгдлээ: ${course.title}`,
                        userIds,
                    );
                }
            } catch (error) {
                console.error('Error sending notification:', error);
            }
    
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
    
    async getGroupCourses(groupId: string, userId: string) {
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

        const is_my_group = group.adminId === userId;

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

        const res = course_data.map(async course => {
            const members =await  this.prisma.courseEnrollment.findMany({
                where: {
                    courseId: course.id,
                },
            });
            const membersCount =  members.length;
            const membersProfile = await Promise.all(members.map(async (member) => {
                const user = await this.prisma.user.findUnique({
                    where: {
                        id: member.userId,
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true,
                        facebookAcc: true,
                        instagramAcc: true,
                        address: true,
                        mobile: true,
                        email: true,
                    }
                });
                return user;
            }))
            
            return {
                ...course,
                is_my_group: is_my_group,
                is_my_course: is_my_group && course.teacherId === userId,
                members: membersCount,
                members_profile: membersProfile,
            }
        })

        return {
            success: true,
            type: 'success',
            message: 'Group courses fetched',
            data: res,
            code: HttpStatus.OK,
        }
    }

    async getGroup(userId: string){
        const groups = await this.prisma.group.findMany( );

        //check user is in group
        const groupMembers = await this.prisma.groupMembers.findMany({
            where: {
                userId,
            },
        });

        const groupIds = groupMembers.map(group => group.groupId);

        const groupMembersProfile = await this.prisma.user.findMany({
            where: {
                id: {
                    in: groupIds,
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                facebookAcc: true,
                instagramAcc: true,
                address: true,
                mobile: true,
                email: true,
            }
        });

        const groupsData = groups.map(async group => {
            const isMember = groupIds.includes(group.id);
            let members = await this.prisma.groupMembers.findMany({
                where: { groupId: group.id }
            });
            if (!members) {
                members = [];
            }
            const membersCount = members.length;
            const groupMembersProfile = await this.prisma.user.findMany({
                where: {
                    id: {
                        in: members.map(member => member.userId),
                    }
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    facebookAcc: true,
                    instagramAcc: true,
                    address: true,
                    mobile: true,
                    email: true,
                }
            });
            return {
                ...group,
                members: membersCount,
                members_profile: groupMembersProfile,
                is_member: isMember,
                is_my_group: group.adminId === userId,
            }
        })

        return {
            success: true,
            type: 'success',
            message: 'Groups fetched',
            data: groupsData,
            code: HttpStatus.OK,
        }
    }

    async getPopularGroups(userId: string) {
        const groups = await this.prisma.group.findMany({
            orderBy: {
                GroupMembers: {
                    _count: 'desc',
                }
            }
        });
        //check user is in group
        const groupMembers = await this.prisma.groupMembers.findMany({
            where: {
                userId: userId,
            },
            include: { user: true },
        });
        const groupIds = groupMembers.map(group => group.groupId);
        
        const groupsData = groups.map(async group => {
            const isMember = groupIds.includes(group.id);
            let members = await this.prisma.groupMembers.findMany({
                where: { groupId: group.id }
            });
            if (!members) {
                members = [];
            }
            const groupMembersProfile = await this.prisma.user.findMany({
                where: {
                    id: {
                        in: members.map(member => member.userId),
                    }
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    facebookAcc: true,
                    instagramAcc: true,
                    address: true,
                    mobile: true,
                    email: true,
                }
            });
            return {
                ...group,
                members:members,
                members_profile: groupMembersProfile,
                is_member: isMember,
                is_my_group: group.adminId === userId,
            }
        })
        return {
            success: true,
            type: 'success',
            message: 'Popular groups fetched',
            data: groupsData,
            code: HttpStatus.OK,
        }
    }

    async getGroupById(groupId: string, userId: string) {
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

        const teacher = await this.prisma.teacher.findUnique({
            where: {
                id: group.adminId,
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

        const teacher_user = await this.prisma.user.findUnique({
            where: {
                id: teacher.userId,
            },
        });
        if (!teacher_user) {
            return {
                success: false,
                type: 'error',
                message: 'Teacher user not found',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const groupMembers = await this.prisma.groupMembers.findMany({
        })

        const groupCourses = await this.prisma.groupCourses.findMany({
            where: {
                groupId,
            },
        });
        
        const courseIds = groupCourses.map(course => course.courseId);

        const courseMembersProfile = await this.prisma.user.findMany({
            where: {
                id: {
                    in: groupMembers.map(member => member.userId),
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                facebookAcc: true,
                instagramAcc: true,
                address: true,
                mobile: true,
                email: true,
            }       
        });

        const groupCoursesData = await this.prisma.courses.findMany({
            where: {
                id: {
                    in: courseIds,
                }
            },
        });

        const events = await this.prisma.event.findMany({
            where: {
                groupId,
            },
        });

        const activities = await this.prisma.groupActivities.findMany({
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
                first_name: teacher_user.firstName,
                last_name: teacher_user.lastName,
                profile_image: teacher_user.profileImage,
                gmail: teacher_user.email,
                mobile: teacher_user.mobile,
                is_my_group: teacher_user.id === userId,
                is_member: groupMembers.some(member => member.userId === userId),
                members: groupMembers.length,
                members_profile: courseMembersProfile,
                courses: groupCoursesData,
                events: events,
                activities: activities,
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
