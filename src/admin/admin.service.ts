import { Injectable, HttpStatus, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwsS3Service } from 'src/s3.service';
import { AdminCreateDto, AdminLoginDto } from './admin.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { error } from 'console';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly awsS3Service: AwsS3Service,
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
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
            expiresIn: '1d',
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

    
}

