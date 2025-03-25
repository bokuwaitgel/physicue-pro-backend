import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, CreateEventDto, CreateEventCommentDto, GroupMemberDto , GroupCourseDto} from './group.dto';
import { get } from 'http';

@Controller('groups')
export class GroupsController {
    constructor(private groupsService: GroupsService) {}

    //group
    @Post('create')
    createGroup(@Body() createGroupDto: CreateGroupDto) {
        return this.groupsService.createGroup(createGroupDto);
    }

    @Put('update/:id')
    updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
        return this.groupsService.updateGroup(id, updateGroupDto);
    }

    @Get(':teacherId')
    getGroups(@Param('teacherId') teacherId: string) {
        return this.groupsService.getGroups(teacherId);
    }

    //event
    @Post('event/create')
    createEvent(@Body() createEventDto: CreateEventDto) {
        return this.groupsService.createEvent(createEventDto);
    }

    @Put('event/update/:id')
    updateEvent(@Param('id') id: string, @Body() updateEventDto: CreateEventDto) {
        return this.groupsService.updateEvent(id, updateEventDto);
    }

    //comment
    @Post('event/comment/create')
    createEventComment(@Body() createEventCommentDto: CreateEventCommentDto) {
        return this.groupsService.createEventComment(createEventCommentDto);
    }

    //member
    @Post('member/add')
    addMember(@Body() groupMemberDto: GroupMemberDto) {
        return this.groupsService.addGroupMember(groupMemberDto);
    }

    @Put('member/update/:id')
    updateMember(@Param('id') id: string, @Body() groupMemberDto: GroupMemberDto) {
        return this.groupsService.updateGroupMember(id, groupMemberDto);
    }

    //course
    @Post('group/course')
    addCourse(@Body() groupCourseDto: GroupCourseDto) {
        return this.groupsService.addCourseToGroup(groupCourseDto);
    }

    @Get('group/course/:groupId')
    getCourse(@Param('groupId') groupId: string) {
        return this.groupsService.getGroups(groupId);
    }
}
