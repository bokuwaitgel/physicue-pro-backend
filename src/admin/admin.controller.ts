import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
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

import { CreateGroupDto, UpdateGroupDto  } from 'src/groups/group.dto';
import { CreateCourseDto, UpdateCourseDto } from 'src/cources/course/course.dto';
import { CreateExerciseDto, UpdateExerciseDto } from 'src/cources/exercise/exercise.dto';


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

    @Post('createGroup/:teacherId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async createGroup(@Body() createGroupDto: CreateGroupDto, @Param('teacherId') teacherId: string) {
        return this.adminService.createGroup(createGroupDto, teacherId);
    }

    @Put('updateGroup/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
        return this.adminService.updateGroup(id, updateGroupDto);
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

    @Post('createCourse/:teacherId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async createCourse(@Body() createCourseDto: CreateCourseDto, @Param('teacherId') teacherId: string) {
        return this.adminService.createCourse(createCourseDto, teacherId);
    }

    @Put('updateCourse/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async updateCourse(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
        return this.adminService.updateCourse(id, updateCourseDto);
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

    @Post('createExercise/:teacherId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async createExercise(@Body() createExerciseDto: CreateExerciseDto, @Param('teacherId') teacherId: string) {
        return this.adminService.createExercise(createExerciseDto, teacherId);
    }

    @Put('updateExercise/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async updateExercise(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto) {
        return this.adminService.updateExercise(id, updateExerciseDto);
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

    // enroll course to users
    @Post('enrollCourse')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async enrollCourseToUsers(@Body() data: {courseId: string, userId: string}) {
        return this.adminService.enrollCourseToUsers(data.courseId, data.userId);
    }

}
