import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

// title       String
//   description String   @default("")
//   startTime   DateTime
//   endTime     DateTime 
//   location    String   @default("")

//   imageURL    String   @default("")

export class CreateEventDto {
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
    imageURL: string;
    @ApiProperty()
    startTime: string;
    @ApiProperty()
    endTime: string;
}

export class EventLikeDto {
    @IsNotEmpty()
    @ApiProperty()
    eventId: string;
}