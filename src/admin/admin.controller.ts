import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


import { JwtAuthGuard } from './jwt-auth.guard';

import { 
    AdminCreateDto,
    AdminLoginDto,
} from './admin.dto';
import { createTeacherDto } from 'src/users/users.dto';

import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

    @Post('login')
    async login(@Body() loginDto: AdminLoginDto) {
        return this.adminService.login(loginDto);
    }

    @Post('create')
    async create(@Body() createDto: AdminCreateDto) {
        return this.adminService.createAdmin(createDto);
    }

    // Users
    
    @Get('users')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getUsers() {
        return this.adminService.getUsers();
    }

    @Get('user/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getUser(@Req() req, @Param('id') id: string) {
        return this.adminService.getUserDetails(id);
    }


    // get teachers
    @Get('teachers')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getTeachers() {
        return this.adminService.getTeachers();
    }

    @Get('teacher/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getTeacher(@Req() req, @Param('id') id: string) {
        return this.adminService.getTeacherDetails(id);
    }


    @Post('createTeacher')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async createTeacher(@Body() CreateTeacherDto: createTeacherDto) {
        return this.adminService.createTeacher(CreateTeacherDto);
    }   
    
    @Post('deactivateTeacher/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async deactivateTeacher(@Param('id') id: string) {
        return this.adminService.deactivateTeacher(id);
    }   


   //Groups
    @Get('groups')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getGroups() {
        return this.adminService.getGroups();
    }

    @Get('group/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getGroup(@Req() req, @Param('id') id: string) {
        return this.adminService.getGroupDetails(id);
    }
    
    @Delete('group/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async deleteGroup(@Param('id') id: string) {
        return this.adminService.deleteGroup(id);
    }

    
    // Courses
    @Get('courses')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getCourses() {
        return this.adminService.getCourses();
    }

    @Get('course/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getCourse(@Req() req, @Param('id') id: string) {
        return this.adminService.getCourseDetails(id);
    }

    @Delete('course/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async deleteCourse(@Param('id') id: string) {
        return this.adminService.deleteCourse(id);
    }

    // Exercises
    @Get('exercises')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getExercises() {
        return this.adminService.getExercises();
    }


    @Get('exercise/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getExercise(@Req() req, @Param('id') id: string) {
        return this.adminService.getExerciseDetails(id);
    }

    @Delete('exercise/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async deleteExercise(@Param('id') id: string) {
        return this.adminService.deleteExercise(id);
    }

    // payments
    @Get('payments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getPayments() {
        return this.adminService.getPayments();
    }

    @Get('payment/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getPayment(@Req() req, @Param('id') id: string) {
        return this.adminService.getPaymentDetails(id);
    }

    // Analytics
    @Get('analytics')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getAnalytics() {
        return this.adminService.getAnalytics();
    }

}
