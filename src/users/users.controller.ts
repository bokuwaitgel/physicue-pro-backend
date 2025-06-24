import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, UseGuards, Headers } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto, createTeacherDto, updateTeacherDto, loginUserDto, logoutUserDto,FileUploadDto, createSubPlanDto, updateSubPlanDto } from './users.dto';
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
        const decoded =await this.authService.verifyToken({token: auth});
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

    // @Post('teacher')
    // createTeacher(@Body() createTeacherDto: createTeacherDto) {
    //     return this.usersService.createTeacher(createTeacherDto);
    // }

    @Post('teacher')
    @ApiConsumes('multipart/form-data')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    async createTeacher(
        @UploadedFile() file: Express.Multer.File,
        @Body() createTeacherDto: createTeacherDto,
        @Headers('Authorization') auth: string

    ) {    
        return this.usersService.createTeacher(createTeacherDto, file);
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

    @Post('termAccepted')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async termAccepted(@Headers('Authorization') auth: string) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        return this.usersService.isTermAccepted( decoded.data.id);
    }


    @Post('createPlan')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async createPlan(@Headers('Authorization') auth: string, @Body() data: createSubPlanDto) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        return this.usersService.createPlan(data);
    }

    @Get('getPlans')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getPlans(@Headers('Authorization') auth: string) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        return this.usersService.getPlans();
    }

    @Put('updatePlan/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async updatePlan(@Headers('Authorization') auth: string, @Param('id') id: string, @Body() data: updateSubPlanDto) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        return this.usersService.updatePlan(id, data);
    }

    @Post('subscribePlan')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async subscribePlan(@Headers('Authorization') auth: string, @Body() data: {planId: string}) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        return this.usersService.subscribePlan( decoded.data.id, data.planId);
    }

    @Get('getSubscribedPlan')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getSubscribedPlan(@Headers('Authorization') auth: string) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        return this.usersService.getSubscribedPlan(decoded.data.id);
    }
    
}
