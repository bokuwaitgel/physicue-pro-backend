import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @ApiProperty()
    groupId: string;
    @IsNotEmpty()
    @ApiProperty()
    title: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    type: string = 'video'; // Default to 'text' if not specified
    @ApiProperty()
    contentUrl: string;
}

export class UpdatePostDto {
    @IsNotEmpty()
    @ApiProperty()
    groupId: string;
    @IsNotEmpty()
    @ApiProperty()
    title: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    contentUrl: string;
    @ApiProperty() 
    status: string = 'active';
}