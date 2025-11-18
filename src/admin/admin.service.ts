import { Injectable, HttpStatus, UnauthorizedException, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwsS3Service } from 'src/s3.service';
import { JwtService } from '@nestjs/jwt';
import { AdminCreateDto, AdminLoginDto } from './admin.dto';
import { CreateGroupDto, UpdateGroupDto  } from 'src/groups/group.dto';
import { CreateCourseDto, UpdateCourseDto } from 'src/cources/course/course.dto';
import { CreateExerciseDto, UpdateExerciseDto } from 'src/cources/exercise/exercise.dto';
import { createTeacherDto } from 'src/users/users.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './jwt.strategy';

import { PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly awsS3Service: AwsS3Service,
        private readonly jwtService: JwtService
    ) {}

    async createAdmin(dto: AdminCreateDto): Promise<any> {
        const existingAdmin = await this.prisma.adminUser.findFirst({
            where: { username: dto.username },
        });
        if (existingAdmin) {
            return {
                success: false,
                type: 'error',
                message: 'Admin with this username already exists',
                code: HttpStatus.CONFLICT,
            }
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const admin = await this.prisma.adminUser.create({
            data: {
                username: dto.username,
                password: hashedPassword,
            },
        });

        return {
            id: admin.id,
            username: admin.username,
            role: admin.role
        };
    }

    async login(dto: AdminLoginDto): Promise<any> {
        const admin = await this.prisma.adminUser.findFirst({
            where: { username: dto.username },
        });
        if (!admin) {
            return {
                success: false,
                type: 'error',
                message: 'Admin with this username does not exist',
                code: HttpStatus.NOT_FOUND,
            }
        }

        const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
        if (!isPasswordValid) {
            return {
                success: false,
                type: 'error',
                message: 'Invalid credentials',
                code: HttpStatus.UNAUTHORIZED
            }
        }

        const payload = { sub: admin.id, email: admin.username };
        const user: JwtPayload = { username: dto.username };
        
        const accessToken = await this.jwtService.signAsync(user, {
            secret: process.env.SECRETKEY,
            expiresIn: process.env.EXPIRESINACCESS,
        });

        return { 
            success: true,
            type: 'success',
            message: 'Login successful',
            code: HttpStatus.ACCEPTED,
            accessToken: accessToken
        };
    }

    async verifyToken(token: string): Promise<any> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
            return {
                success: true,
                type: 'success',
                message: 'Token is valid',
                code: HttpStatus.OK,
                data: decoded
            };
        } catch (error) {
            return {
                success: false,
                type: 'error',
                message: 'Invalid token',
                code: HttpStatus.UNAUTHORIZED
            };
        }
    }


    // User 
    async getUsers(): Promise<any> {
        const users = await this.prisma.user.findMany();
        return {
            success: true,
            type: 'success',
            message: 'Users retrieved successfully',
            code: HttpStatus.OK,
            data: users
        };
    }

    async getAdmins(): Promise<any> {
        const admins = await this.prisma.adminUser.findMany();
        return {
            success: true,
            type: 'success',
            message: 'Admins retrieved successfully',
            code: HttpStatus.OK,
            data: admins
        };
    }

    async getUserDetails(userId: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return {
                success: false,
                type: 'error',
                message: 'User not found',
                code: HttpStatus.NOT_FOUND,
            };
        }
        return {
            success: true,
            type: 'success',
            message: 'User details retrieved successfully',
            code: HttpStatus.OK,
            data: user
        };
    }

    async getTeachers(): Promise<any> {
        const teachers = await this.prisma.teacher.findMany({});
        return {
            success: true,
            type: 'success',
            message: 'Teachers retrieved successfully',
            code: HttpStatus.OK,
            data: teachers
        };
    }

    async getTeacherDetails(teacherId: string): Promise<any> {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
        });

        

        if (!teacher) {
            return {
                success: false,
                type: 'error',
                message: 'Teacher not found',
                code: HttpStatus.NOT_FOUND,
            };
        }

        // Include user details in the response
        const user = await this.prisma.user.findUnique({
            where: { id: teacher.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                mobile: true,
                profileImage: true,
            },
        });

        return {
            success: true,
            type: 'success',
            message: 'Teacher details retrieved successfully',
            code: HttpStatus.OK,
            data: {
                ...teacher,
                ...user
            }
        };
    }

    async createTeacher(createTeacherDto: createTeacherDto): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { id: createTeacherDto.userId },
        });
        if (!user) {
            return {
                success: false,
                type: 'error',
                message: 'User not found',
                code: HttpStatus.NOT_FOUND,
            };
        }

        const teacher = await this.prisma.teacher.create({
            data: {
                userId: user.id,
                description: createTeacherDto.description ? createTeacherDto.description : '',
                name: createTeacherDto.name ? createTeacherDto.name : user.firstName + ' ' + user.lastName,
                aboutMe: createTeacherDto.aboutMe ? createTeacherDto.aboutMe : '',
                phone: createTeacherDto.phone ? createTeacherDto.phone : user.mobile,
                experience: createTeacherDto.experience ? createTeacherDto.experience : '',
                status: 'active',
            },
        });

        return {
            success: true,
            type: 'success',
            message: 'Teacher created successfully',
            code: HttpStatus.CREATED,
            data: teacher
        };
    }

    async deactivateTeacher(teacherId: string): Promise<any> {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
        });
        if (!teacher) {
            return {
                success: false,
                type: 'error',
                message: 'Teacher not found',
                code: HttpStatus.NOT_FOUND,
            };
        }

        const updatedTeacher = await this.prisma.teacher.update({
            where: { id: teacherId },
            data: { status: 'inactive' },
        });

        return {
            success: true,
            type: 'success',
            message: 'Teacher deactivated successfully',
            code: HttpStatus.OK,
            data: updatedTeacher
        };
    }


    //Group Management
    async getGroups(): Promise<any> {
        const groups = await this.prisma.group.findMany({
        });
        return {
            success: true,
            type: 'success',
            message: 'Groups retrieved successfully',
            code: HttpStatus.OK,
            data: groups
        };
    }

    // Create Group
    async createGroup(createGroupDto: CreateGroupDto, teacherId: string): Promise<any> {
        const group = await this.prisma.group.create({
            data: {
                name: createGroupDto.name,
                admin: {
                    connect: { id: teacherId },
                },
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Group created successfully',
            code: HttpStatus.CREATED,
            data: group
        };
    }
    // Update Group
    async updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<any>
    {
        const group = await this.prisma.group.update({
            where: { id: id },
            data: {
                name: updateGroupDto.name,
                description: updateGroupDto.description,
                bannerImage: updateGroupDto.bannerImage,
                requirements: updateGroupDto.requirements,
                adminId: updateGroupDto.adminId,
                status: updateGroupDto.status,
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Group updated successfully',
            code: HttpStatus.OK,
            data: group
        };
    }

    //deleteGroup
    async deleteGroup(groupId: string): Promise<any> {
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return {
                success: false,
                type: 'error',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            };
        }

        // Delete all related records first to avoid foreign key violations

        // Delete event-related data
        const events = await this.prisma.event.findMany({
            where: { groupId },
            select: { id: true }
        });
        
        for (const event of events) {
            // Delete event likes and comments
            await this.prisma.eventLike.deleteMany({
                where: { eventId: event.id }
            });
            await this.prisma.eventComment.deleteMany({
                where: { eventId: event.id }
            });
        }

        // Delete events
        await this.prisma.event.deleteMany({
            where: { groupId }
        });

        // Delete post-related data
        const posts = await this.prisma.post.findMany({
            where: { groupId },
            select: { id: true }
        });

        for (const post of posts) {
            // Delete post likes and comments
            await this.prisma.postLike.deleteMany({
                where: { postId: post.id }
            });
            await this.prisma.postComment.deleteMany({
                where: { postId: post.id }
            });
        }

        // Delete posts
        await this.prisma.post.deleteMany({
            where: { groupId }
        });

        // Delete stories
        await this.prisma.story.deleteMany({
            where: { GroupId: groupId }
        });

        // Delete group courses
        await this.prisma.groupCourses.deleteMany({
            where: { groupId }
        });

        // Delete group activities
        await this.prisma.groupActivities.deleteMany({
            where: { groupId }
        });

        // Delete group members
        await this.prisma.groupMembers.deleteMany({
            where: { groupId }
        });

        // Finally, delete the group
        await this.prisma.group.delete({
            where: { id: groupId },
        });

        return {
            success: true,
            type: 'success',
            message: 'Group deleted successfully',
            code: HttpStatus.OK,
        };
    }

    async getGroupDetails(groupId: string): Promise<any> {
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return {
                success: false,
                type: 'error',
                message: 'Group not found',
                code: HttpStatus.NOT_FOUND,
            };
        }
        return {
            success: true,
            type: 'success',
            message: 'Group details retrieved successfully',
            code: HttpStatus.OK,
            data: group
        };
    }

    // Course Management
    async getCourses(): Promise<any> {
        const courses = await this.prisma.courses.findMany({

        });
        return {
            success: true,
            type: 'success',
            message: 'Courses retrieved successfully',
            code: HttpStatus.OK,
            data: courses
        };
    }

    async createCourse(createCourseDto: CreateCourseDto, teacherId: string): Promise<any> {
        const course = await this.prisma.courses.create({
            data: {
                title: createCourseDto.title,
                description: createCourseDto.description,
                duration: Number(createCourseDto.duration),
                price: Number(createCourseDto.price),
                teacher: {
                    connect: { id: teacherId },
                },
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Course created successfully',
            code: HttpStatus.CREATED,
            data: course
        };
    }

    async updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<any> {
        const course = await this.prisma.courses.update({
            where: { id: id },
            data: {
                title: updateCourseDto.title,
                description: updateCourseDto.description,
                duration: Number(updateCourseDto.duration),
                price: Number(updateCourseDto.price),
                teacherId: updateCourseDto.teacherId,
                bannerImage: updateCourseDto.bannerImage,
                shortVideo: updateCourseDto.shortVideo,
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Course updated successfully',
            code: HttpStatus.OK,
            data: course    
        };
    }

    async getCourseDetails(courseId: string): Promise<any> {
        const course = await this.prisma.courses.findUnique({
            where: { id: courseId },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        aboutMe: true,
                        phone: true,
                        experience: true,
                    },
                },
                courseEnrollments: {
                    select: {
                        userId: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                mobile: true,
                                email: true,
                            }
                        }
                    }
                },
                courseExercises: {
                    select: {
                        id: true,    
                    }
                }
            },
        });
        if (!course) {
            return {
                success: false,
                type: 'error',
                message: 'Course not found',
                code: HttpStatus.NOT_FOUND,
            };
        }
        return {
            success: true,
            type: 'success',
            message: 'Course details retrieved successfully',
            code: HttpStatus.OK,
            data: course
        };
    }
    async deleteCourse(courseId: string): Promise<any> {
        const course = await this.prisma.courses.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            return {
                success: false,
                type: 'error',
                message: 'Course not found',
                code: HttpStatus.NOT_FOUND,
            };
        }

        // Delete all related records first to avoid foreign key violations

        // Get all course enrollments
        const enrollments = await this.prisma.courseEnrollment.findMany({
            where: { courseId },
            select: { id: true }
        });

        // Delete bookings for each enrollment
        for (const enrollment of enrollments) {
            await this.prisma.booking.deleteMany({
                where: { enrolledId: enrollment.id }
            });
        }

        // Delete course enrollments
        await this.prisma.courseEnrollment.deleteMany({
            where: { courseId }
        });

        // Delete direct bookings (if any)
        await this.prisma.booking.deleteMany({
            where: { courseId }
        });

        // Delete course schedules
        await this.prisma.courseSchedule.deleteMany({
            where: { courseId }
        });

        // Delete group courses
        await this.prisma.groupCourses.deleteMany({
            where: { courseId }
        });

        // Delete course exercises
        await this.prisma.courseExercises.deleteMany({
            where: { courseId }
        });

        // Finally, delete the course
        await this.prisma.courses.delete({
            where: { id: courseId },
        });

        return {
            success: true,
            type: 'success',
            message: 'Course deleted successfully',
            code: HttpStatus.OK,
        };
    }

    // Exercise Management
    async getExercises(): Promise<any> {
        const exercises = await this.prisma.exercises.findMany({
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Exercises retrieved successfully',
            code: HttpStatus.OK,
            data: exercises
        };
        
    }

    async createExercise(data: CreateExerciseDto,  teacherId: string): Promise<any> {
       const res = await this.prisma.exercises.create({
        data: {
          name: data.name,
          day: parseInt(data.day),
          level: data.level,
          type: data.type,
          videoType: data.videoType,
          video: data.videoUrl,
          description: data?.description ? data.description : '',
          teacher: {
            connect: {
              id: teacherId
            }
        }
        }
      });
      if(!res){
        return {
          status: false,
          type: 'error',
          message: 'Exercise not created',
          code : HttpStatus.BAD_REQUEST,
        }
      }
    }

    async updateExercise(id: string, updateExerciseDto: UpdateExerciseDto): Promise<any> {
        const exercise = await this.prisma.exercises.update({
            where: { id: id },
            data: {
                name: updateExerciseDto.name,
                description: updateExerciseDto.description,
                purpose: updateExerciseDto.purpose,
                duration: updateExerciseDto.duration,
                day: updateExerciseDto.day,
                level: updateExerciseDto.level,
                type: updateExerciseDto.type,
                image: updateExerciseDto.image,
                video: updateExerciseDto.video,
                teacherId: updateExerciseDto.teacherId,
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Exercise updated successfully',
            code: HttpStatus.OK,
            data: exercise
        };
    }

    async getExerciseDetails(exerciseId: string): Promise<any> {
        const exercise = await this.prisma.exercises.findUnique({
            where: { id: exerciseId },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                    },
                }
            },
        });
        if (!exercise) {
            return {
                success: false,
                type: 'error',
                message: 'Exercise not found',
                code: HttpStatus.NOT_FOUND,
            };
        }
        return {
            success: true,
            type: 'success',
            message: 'Exercise details retrieved successfully',
            code: HttpStatus.OK,
            data: exercise
        };
    }

    async deleteExercise(exerciseId: string): Promise<any> {
        const exercise = await this.prisma.exercises.findUnique({
            where: { id: exerciseId },
        });
        if (!exercise) {
            return {
                success: false,
                type: 'error',
                message: 'Exercise not found',
                code: HttpStatus.NOT_FOUND,
            };
        }

        // Delete all related records first to avoid foreign key violations

        // Delete user exercise progress
        await this.prisma.userExerciseProgress.deleteMany({
            where: { exerciseId }
        });

        // Delete course exercises
        await this.prisma.courseExercises.deleteMany({
            where: { exerciseId }
        });

        // Finally, delete the exercise
        await this.prisma.exercises.delete({
            where: { id: exerciseId },
        });

        return {
            success: true,
            type: 'success',
            message: 'Exercise deleted successfully',
            code: HttpStatus.OK,
        };
    }


    // Payment Management
    async getPayments(): Promise<any> {
        const payments = await this.prisma.payment.findMany({
            include: {
                User: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                }
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'Payments retrieved successfully',
            code: HttpStatus.OK,
            data: payments
        };
    }

    async getPaymentDetails(paymentId: string): Promise<any> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                User: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                }
            },
        });
        if (!payment) {
            return {
                success: false,
                type: 'error',
                message: 'Payment not found',
                code: HttpStatus.NOT_FOUND,
            };
        }
        return {
            success: true,
            type: 'success',
            message: 'Payment details retrieved successfully',
            code: HttpStatus.OK,
            data: payment
        };
    }


    // Analytics Management
    async getAnalytics(): Promise<any> {
        const totalUsers = await this.prisma.user.count();
        const totalAdmins = await this.prisma.adminUser.count();
        const totalTeachers = await this.prisma.teacher.count();
        const totalCourses = await this.prisma.courses.count();
        const totalExercises = await this.prisma.exercises.count();
        const totalGroups = await this.prisma.group.count();

        // total revenue last month and this month and  per month give upper or lower from before month
        const lastMonthRevenue = await this.prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: PaymentStatus.SUCCESS,
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                    lt: new Date(),
                },
            },
        });
        const thisMonthRevenue = await this.prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: PaymentStatus.SUCCESS,
                createdAt: {
                    gte: new Date(new Date().setDate(1)), // Start of this month
                },
            },
        });

        const revenueComparison = {
            lastMonth: lastMonthRevenue._sum.amount || 0,
            thisMonth: thisMonthRevenue._sum.amount || 0,
            change: (thisMonthRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0),
            percentageChange: lastMonthRevenue._sum.amount ? 
                (((thisMonthRevenue._sum.amount ?? 0) - (lastMonthRevenue._sum.amount ?? 0)) / (lastMonthRevenue._sum.amount ?? 1)) * 100 : 0,
        };

        // new users last month and this month and per month give upper or lower from before month
        const lastMonthUsers = await this.prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                    lt: new Date(),
                },
            },
        });
        const thisMonthUsers = await this.prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(1)), // Start of this month
                },
            },
        });

        const userComparison = {
            lastMonth: lastMonthUsers,
            thisMonth: thisMonthUsers,
            change: thisMonthUsers - lastMonthUsers,
            percentageChange: lastMonthUsers ? 
                ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0,
        };

        // last 3 months purchase history
        const lastThreeMonthsPurchases = await this.prisma.payment.groupBy({
            by: ['createdAt'],
            _sum: {
                amount: true,
            },
            where: {
                status: PaymentStatus.SUCCESS,
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        const formattedPurchases = lastThreeMonthsPurchases.map(purchase => ({
            month: purchase.createdAt.toISOString().slice(0, 10), // Format as YYYY-MM-DD
            totalAmount: purchase._sum.amount || 0,
        }));
        // Return the analytics data
        const analytics = {
            totalUsers,
            totalAdmins,
            totalCourses,
            totalTeachers,
            totalExercises,
            totalGroups,
            revenueComparison,
            userComparison, 
            lastThreeMonthsPurchases: formattedPurchases,
        };
        



        return {
            success: true,
            type: 'success',
            message: 'Analytics retrieved successfully',
            code: HttpStatus.OK,
            data: analytics
        };
    }

    async findByLogin(username: string): Promise<any> {
        const admin = await this.prisma.adminUser.findFirst({
            where: { username: username },
        });
        if (!admin) {
            throw new UnauthorizedException('Admin not found');
        }
        return admin;
      }

    async validateUser(payload: JwtPayload): Promise<any> {
        const user = await this.findByLogin(payload.username);
        if (!user) {
          throw new HttpException('INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
        }
        return user;
      }

    async enrollCourseToUsers(courseId: string, userId: string): Promise<any> {
        const course = await this.prisma.courses.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            return {
                success: false,
                type: 'error',
                message: 'Course not found',
                code: HttpStatus.NOT_FOUND,
            };
        }

       const user = await this.prisma.user.findUnique({ 
            where: { id: userId },
        });
        if (!user) {
            return {
                success: false,
                type: 'error',
                message: 'User not found',
                code: HttpStatus.NOT_FOUND,
            };
        }

        const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
            where: {
                courseId: courseId,
                userId: userId,
            },
        });
        if (existingEnrollment) {
            return {
                success: false,
                type: 'error',
                message: 'User already enrolled in this course',
                code: HttpStatus.CONFLICT,
            };
        }

        const teacher = await this.prisma.teacher.findUnique({
            where: { id: course.teacherId },
        });
        if (!teacher) {
            return {
                success: false,
                type: 'error',
                message: 'Teacher not found for this course',
                code: HttpStatus.NOT_FOUND,
            };
        }

        const enrollments = await this.prisma.courseEnrollment.create({
            data: {
                courseId: courseId,
                userId: userId,
                teacherId: teacher.id,
            },
        });

        return {
            success: true,
            type: 'success',
            message: 'User enrolled in course successfully',
            code: HttpStatus.CREATED,
            data: {
                enrollmentId: enrollments.id,
                courseId: courseId,
                userId: userId,
                teacherId: teacher.id,
            },
        };
    }


}