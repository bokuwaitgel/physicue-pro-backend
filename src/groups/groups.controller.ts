import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, CreateEventDto, CreateEventCommentDto, GroupMemberDto , GroupCourseDto} from './group.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 
@Controller('groups')
export class GroupsController {
    constructor(private groupsService: GroupsService) {}

    //group
    @Post('create')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    createGroup(@Body() createGroupDto: CreateGroupDto) {
        return this.groupsService.createGroup(createGroupDto);
    }

    @Put('update/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
        return this.groupsService.updateGroup(id, updateGroupDto);
    }

    @Get(':teacherId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    getGroups(@Param('teacherId') teacherId: string) {
        return this.groupsService.getGroups(teacherId);
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
    getCourse(@Param('groupId') groupId: string) {
        return this.groupsService.getGroups(groupId);
    }

    @Get('')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    getAllGroups() {
        return this.groupsService.getGroup();
    }

    @Get('groupDetail/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    getGroupDetail(@Param('id') id: string) {
        return this.groupsService.getGroupById(id);
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
}
