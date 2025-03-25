import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createTeacherDto, updateTeacherDto } from './users.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

    @Post('register')
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }

    @Get(':id')
    findUser(@Param('id') id: string) {
        return this.usersService.get(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateUserDto: CreateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Post('teacher')
    createTeacher(@Body() createTeacherDto: createTeacherDto) {
        return this.usersService.createTeacher(createTeacherDto);
    }

    @Get('teacher/:id')
    findTeacher(@Param('id') id: string) {
        return this.usersService.getTeacher(id);
    }

    @Put('teacher/:id') 
    updateTeacher(@Param('id') id: string, @Body() updateTeacherDto: updateTeacherDto) {
        return this.usersService.updateTeacher(id, updateTeacherDto);
    }

    @Get('teachers')
    getTeachers() {
        return this.usersService.getTeachers();
    }



}