import { UsersService } from './users.service';
import { CreateUserDto } from './users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: import("@nestjs/common").HttpStatus;
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
        code: import("@nestjs/common").HttpStatus;
        error?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        error: any;
        code: import("@nestjs/common").HttpStatus;
        data?: undefined;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: import("@nestjs/common").HttpStatus;
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
        code: import("@nestjs/common").HttpStatus;
    }>;
    findUser(id: string): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: import("@nestjs/common").HttpStatus;
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
        code: import("@nestjs/common").HttpStatus;
    }>;
    update(id: string, updateUserDto: CreateUserDto): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: import("@nestjs/common").HttpStatus;
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
        code: import("@nestjs/common").HttpStatus;
    }>;
    createTeacher(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        type: string;
        message: string;
        code: import("@nestjs/common").HttpStatus;
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
        code: import("@nestjs/common").HttpStatus;
        error?: undefined;
    } | {
        success: boolean;
        type: string;
        message: string;
        error: any;
        code: import("@nestjs/common").HttpStatus;
        data?: undefined;
    }>;
}
