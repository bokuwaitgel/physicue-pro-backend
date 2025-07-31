import { Injectable, HttpStatus, UnauthorizedException, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwsS3Service } from 'src/s3.service';
import { JwtService } from '@nestjs/jwt';
import { AdminCreateDto, AdminLoginDto } from './admin.dto';
import { createTeacherDto } from 'src/users/users.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './jwt.strategy';

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
        const totalCourses = await this.prisma.courses.count();
        const totalExercises = await this.prisma.exercises.count();
        const totalGroups = await this.prisma.group.count();

        // total revenue last month and this month and  per month give upper or lower from before month
        const lastMonthRevenue = await this.prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
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
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        const formattedPurchases = lastThreeMonthsPurchases.map(purchase => ({
            month: purchase.createdAt.toISOString().slice(0, 7), // Format as YYYY-MM
            totalAmount: purchase._sum.amount || 0,
        }));
        // Return the analytics data
        const analytics = {
            totalUsers,
            totalAdmins,
            totalCourses,
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
    

}

