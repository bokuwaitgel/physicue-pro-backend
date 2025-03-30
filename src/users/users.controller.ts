import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto, createTeacherDto, updateTeacherDto, loginUserDto, logoutUserDto,FileUploadDto } from './users.dto';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

    @Post('register')
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Post('login')
    login(@Body() loginUserDto: loginUserDto) {
        return this.usersService.login(loginUserDto);
    }

    @Post('logout')
    logout(@Body() logoutUserDto: logoutUserDto) {
        return this.usersService.logout(logoutUserDto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }

    @Get('get/:id')
    findUser(@Param('id') id: string) {
        return this.usersService.get(id);
    }

    @Put('edit/:id')
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

    @Post('uploadProfileImage/:id')
    @UseInterceptors(FileInterceptor('file'))
    uploadProfileImage(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string
    ) {
        return this.usersService.uploadProfileImage(id, file);
    }
}
