import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class AdminCreateDto {
    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: 'Admin' })
    @IsNotEmpty()
    username: string;
}

export class AdminLoginDto {
    @ApiProperty({ example: 'admin@example.com' })
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    password: string;
}


