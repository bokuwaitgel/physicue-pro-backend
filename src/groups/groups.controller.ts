import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, UseGuards, Headers } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, CreateEventDto, CreateEventCommentDto, GroupMemberDto , GroupCourseDto} from './group.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 
import { AuthService } from 'src/auth/auth.service';
import { Token } from 'aws-sdk';
@Controller('groups')
export class GroupsController {
    constructor(
        private groupsService: GroupsService,
        private authService: AuthService
    ) {}

    @Get('groupTypes')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getGroupTypes() : Promise<any> {
        return this.groupsService.getGroupTypes();
    }

    //group
    @Post('create')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async createGroup(@Body() createGroupDto: CreateGroupDto, @Headers('Authorization') auth: string) {
        const decoded = await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;

        return this.groupsService.createGroup(createGroupDto, userId);
    }

    @Put('update/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
        return this.groupsService.updateGroup(id, updateGroupDto);
    }

    @Get('getTeacher/:teacherId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getGroups(@Param('teacherId') teacherId: string, @Headers('Authorization') auth: string) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.groupsService.getTeacherGroups(teacherId, userId);
    }

    //event
    @Post('event/create')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    createEvent(@Body() createEventDto: CreateEventDto) {
        return this.groupsService.createEvent(createEventDto);
    }

    @Put('event/update/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    updateEvent(@Param('id') id: string, @Body() updateEventDto: CreateEventDto) {
        return this.groupsService.updateEvent(id, updateEventDto);
    }

    //comment
    @Post('event/comment/create')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    createEventComment(@Body() createEventCommentDto: CreateEventCommentDto) {
        return this.groupsService.createEventComment(createEventCommentDto);
    }

    //member
    @Get('members/:groupId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    getGroupMembers(@Param('groupId') groupId: string) {
        return this.groupsService.getGroupMembers(groupId);
    }

    @Post('member/add')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    addMember(@Body() groupMemberDto: GroupMemberDto) {
        return this.groupsService.addGroupMember(groupMemberDto);
    }

    @Put('member/update/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    updateMember(@Param('id') id: string, @Body() groupMemberDto: GroupMemberDto) {
        return this.groupsService.updateGroupMember(id, groupMemberDto);
    }

    @Post('join')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async joinGroup(@Body() data: {groupId: string}, @Headers('Authorization') auth: string) {
        const decoded = await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.groupsService.joinGroup(data.groupId, userId);
    }

    @Post('leave')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async leaveGroup(@Body() data: {groupId: string}, @Headers('Authorization') auth: string) {
        const decoded = await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.groupsService.leaveGroup(data.groupId, userId);
    }

    //course
    @Post('group/course')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    addCourse(@Body() groupCourseDto: GroupCourseDto) {
        return this.groupsService.addCourseToGroup(groupCourseDto);
    }

    @Get('group/course/:groupId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getCourse(@Param('groupId') groupId: string, @Headers('Authorization') auth: string) {
        const decoded =await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        

        return this.groupsService.getGroupCourses(groupId, userId);
    }

    @Get('')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getAllGroups(@Headers('Authorization') auth: string) {
        const decoded = await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.groupsService.getGroup(userId);
    }

    @Get('popular')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getPopGroups(@Headers('Authorization') auth: string) {
        const decoded = await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.groupsService.getPopularGroups(userId);
    }

    @Get('groupDetail/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getGroupDetail(@Param('id') id: string, @Headers('Authorization') auth: string) {
        const decoded = await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.groupsService.getGroupById(id, userId);
    }

    @Post('uploadGroupBanner/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    uploadProfileImage(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string
    ) {
        return this.groupsService.uploadBannerImage(id, file);
    }

    @Delete('delete/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async deleteGroup(@Param('id') id: string, @Headers('Authorization') auth: string) {
        const decoded = await this.authService.verifyToken({token: auth});
        if (decoded.code != 200) {
            return decoded;
        }
        const userId = decoded.data.id;
        return this.groupsService.deleteGroup(id, userId);
    }
}
