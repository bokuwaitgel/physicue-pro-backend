import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, UseGuards, Headers } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto, createTeacherDto, updateTeacherDto, loginUserDto, logoutUserDto,FileUploadDto } from './users.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
) {}


    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }

    @Get('get')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async findUser(@Headers('Authorization') auth: string) {
        //get id from token
        const token = auth.split(' ')[1];
        const decoded =await this.authService.verifyToken({token});
        if (decoded.code != 200) {
            return decoded;
        }
        return this.usersService.get(decoded.data.id);
    }

    @Put('edit/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async update(@Param('id') id: string, @Headers('Authorization') auth: string,  @Body() updateUserDto: CreateUserDto) {
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
    @ApiConsumes('multipart/form-data')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfileImage(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
        @Headers('Authorization') auth: string

    ) {    
        return this.usersService.uploadProfileImage(id, file);
    }
}
