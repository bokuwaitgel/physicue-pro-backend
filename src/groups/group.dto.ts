import { ApiProperty } from '@nestjs/swagger';
// import { GroupType } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';


export class CreateGroupDto {
    @IsNotEmpty()
    @ApiProperty()
    name: string;
}

export class UpdateGroupDto {
    @IsNotEmpty()
    @ApiProperty()
    id: string;
    @IsNotEmpty()
    @ApiProperty()
    name: string;
    @IsNotEmpty()
    @ApiProperty()
    description: string;
    @ApiProperty()
    bannerImage: string;
    @ApiProperty()
    requirements: string;
    @ApiProperty()
    adminId: string;
    @ApiProperty()
    status: string;
    @ApiProperty()
    type:[string]; // Assuming GroupType is an enum defined in your Prisma schema
}

export class  CreateEventDto {
    @IsNotEmpty()
    @ApiProperty()
    groupId: string;
    @IsNotEmpty()
    @ApiProperty()
    title: string;
    @IsNotEmpty()
    @ApiProperty()
    description: string;
    @ApiProperty()
    location: string;
    @ApiProperty()
    image: string;
    @ApiProperty()
    status: string;
    @ApiProperty()
    startDate: string;
    @ApiProperty()
    endDate: string;
    @ApiProperty()
    createdBy: string;
}

export class CreateEventCommentDto {
    @IsNotEmpty()
    @ApiProperty()
    eventId: string;
    @IsNotEmpty()
    @ApiProperty()
    comment: string;
    @IsNotEmpty()
    @ApiProperty()
    userId: string;
}

export class GroupMemberDto {
    @IsNotEmpty()
    @ApiProperty()
    groupId: string;
    @IsNotEmpty()
    @ApiProperty()
    userId: string;
    @ApiProperty()
    status: string;
}

export class GroupCourseDto {
    @IsNotEmpty()
    @ApiProperty()
    groupId: string;
    @IsNotEmpty()
    @ApiProperty()
    courseId: string;
    @IsNotEmpty()
    @ApiProperty()
    status: string;
}