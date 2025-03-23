import { HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, createTeacherDto } from './users.dto';
export declare class UsersService {
    prisma: PrismaService;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: HttpStatus;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        data: {
            mobile: string | null;
            firstName: string | null;
            lastName: string | null;
            firebaseToken: string;
            firebaseId: string;
            profileImage: string;
            coverImage: string;
            email: string | null;
            id: string;
            pushToken: string;
            refreshToken: string | null;
            refreshTokenExpiry: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        code: HttpStatus;
        error?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        error: any;
        code: HttpStatus;
        data?: undefined;
    }>;
    update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: HttpStatus;
        data?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        data: {
            mobile: string | null;
            firstName: string | null;
            lastName: string | null;
            firebaseToken: string;
            firebaseId: string;
            profileImage: string;
            coverImage: string;
            email: string | null;
            id: string;
            pushToken: string;
            refreshToken: string | null;
            refreshTokenExpiry: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        code: HttpStatus;
    }>;
    delete(firebseId: string): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: HttpStatus;
        data?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        data: {
            mobile: string | null;
            firstName: string | null;
            lastName: string | null;
            firebaseToken: string;
            firebaseId: string;
            profileImage: string;
            coverImage: string;
            email: string | null;
            id: string;
            pushToken: string;
            refreshToken: string | null;
            refreshTokenExpiry: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        code: HttpStatus;
    }>;
    get(firebseId: string): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: HttpStatus;
        data?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        data: {
            mobile: string | null;
            firstName: string | null;
            lastName: string | null;
            firebaseToken: string;
            firebaseId: string;
            profileImage: string;
            coverImage: string;
            email: string | null;
            id: string;
            pushToken: string;
            refreshToken: string | null;
            refreshTokenExpiry: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        code: HttpStatus;
    }>;
    createTeacher(createTeacherDto: createTeacherDto): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: HttpStatus;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        data: {
            mobile: string;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            rating: number;
            status: string;
            image: string;
            description: string;
        };
        code: HttpStatus;
        error?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        error: any;
        code: HttpStatus;
        data?: undefined;
    }>;
    updateTeacher(id: string, updateTeacher: Partial<createTeacherDto>): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: HttpStatus;
        data?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        data: {
            mobile: string;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            rating: number;
            status: string;
            image: string;
            description: string;
        };
        code: HttpStatus;
    }>;
    getTeacher(firebseId: string): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: HttpStatus;
        data?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        data: {
            mobile: string;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            rating: number;
            status: string;
            image: string;
            description: string;
        };
        code: HttpStatus;
    }>;
}
