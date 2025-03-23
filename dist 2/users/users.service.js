"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                firebaseId: createUserDto.firebaseId,
            },
        });
        if (user) {
            return {
                success: false,
                type: 'failed',
                message: 'User already exists',
                code: common_1.HttpStatus.FOUND
            };
        }
        try {
            const result = await this.prisma.user.create({
                data: createUserDto,
            });
            return {
                success: true,
                type: 'success',
                message: 'User created',
                data: result,
                code: common_1.HttpStatus.CREATED,
            };
        }
        catch (error) {
            return {
                success: false,
                type: 'failed',
                message: 'Error creating user',
                error: error,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR
            };
        }
    }
    async update(id, updateUserDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                firebaseId: id,
            },
        });
        if (!user) {
            return {
                success: false,
                type: 'failed',
                message: 'User does not exists',
                code: common_1.HttpStatus.NOT_FOUND
            };
        }
        const result = await this.prisma.user.update({
            where: { firebaseId: id },
            data: updateUserDto,
        });
        return {
            success: true,
            type: 'success',
            message: 'User updated',
            data: result,
            code: common_1.HttpStatus.OK,
        };
    }
    async delete(firebseId) {
        const user = await this.prisma.user.findUnique({
            where: {
                firebaseId: firebseId,
            },
        });
        if (!user) {
            return {
                success: false,
                type: 'failed',
                message: 'User does not exists',
                code: common_1.HttpStatus.NOT_FOUND
            };
        }
        const result = await this.prisma.user.delete({
            where: {
                firebaseId: firebseId
            },
        });
        return {
            success: true,
            type: 'success',
            message: 'User deleted',
            data: result,
            code: common_1.HttpStatus.OK,
        };
    }
    async get(firebseId) {
        const user = await this.prisma.user.findUnique({
            where: {
                firebaseId: firebseId,
            },
        });
        if (!user) {
            return {
                success: false,
                type: 'failed',
                message: 'User does not exists',
                code: common_1.HttpStatus.NOT_FOUND
            };
        }
        return {
            success: true,
            type: 'success',
            message: 'User found',
            data: user,
            code: common_1.HttpStatus.OK,
        };
    }
    async createTeacher(createTeacherDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                firebaseId: createTeacherDto.firebaseId,
            },
        });
        if (!user) {
            return {
                success: false,
                type: 'failed',
                message: 'User does not exists',
                code: common_1.HttpStatus.NOT_FOUND
            };
        }
        try {
            const result = await this.prisma.teacher.create({
                data: {
                    userId: user.id,
                    status: createTeacherDto.status,
                    name: createTeacherDto.name,
                    email: createTeacherDto.email,
                    mobile: createTeacherDto.mobile,
                    image: createTeacherDto.image,
                    description: createTeacherDto.description
                },
            });
            return {
                success: true,
                type: 'success',
                message: 'Teacher created',
                data: result,
                code: common_1.HttpStatus.CREATED,
            };
        }
        catch (error) {
            return {
                success: false,
                type: 'failed',
                message: 'Error creating user',
                error: error,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR
            };
        }
    }
    async updateTeacher(id, updateTeacher) {
        const find_user = await this.prisma.user.findUnique({
            where: {
                firebaseId: id,
            },
        });
        if (!find_user) {
            return {
                success: false,
                type: 'failed',
                message: 'User does not exists',
                code: common_1.HttpStatus.NOT_FOUND
            };
        }
        const user = await this.prisma.teacher.findUnique({
            where: {
                id: find_user.id,
            },
        });
        if (!user) {
            return {
                success: false,
                type: 'failed',
                message: 'Teacher does not exists',
                code: common_1.HttpStatus.NOT_FOUND
            };
        }
        const result = await this.prisma.teacher.update({
            where: { id: id },
            data: updateTeacher,
        });
        return {
            success: true,
            type: 'success',
            message: 'Teacher updated',
            data: result,
            code: common_1.HttpStatus.OK,
        };
    }
    async getTeacher(firebseId) {
        const user = await this.prisma.user.findUnique({
            where: {
                firebaseId: firebseId,
            },
        });
        if (!user) {
            return {
                success: false,
                type: 'failed',
                message: 'User does not exists',
                code: common_1.HttpStatus.NOT_FOUND
            };
        }
        const teacher = await this.prisma.teacher.findUnique({
            where: {
                userId: user.id,
            },
        });
        if (!teacher) {
            return {
                success: false,
                type: 'failed',
                message: 'Teacher does not exists',
                code: common_1.HttpStatus.NOT_FOUND
            };
        }
        return {
            success: true,
            type: 'success',
            message: 'Teacher found',
            data: teacher,
            code: common_1.HttpStatus.OK,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map