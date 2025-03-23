import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';


export class CreateSchedulerDto {
    @ApiProperty()
    @IsNotEmpty()
    courseId: string
    @ApiProperty()
    @IsNotEmpty()
    startTime: Date
    @ApiProperty()
    @IsNotEmpty()
    endTime: Date
}

export class deleteSchedulerDto {
    @ApiProperty()
    @IsNotEmpty()
    id: string
}

export class getSchedulerByIdDto {
    @ApiProperty()
    @IsNotEmpty()
    id: string
}

export class bookSchedulerDto {
    @ApiProperty()
    @IsNotEmpty()
    id: string
    
}
