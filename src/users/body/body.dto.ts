import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';


export class CreateBodyDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  weight: number;
  @ApiProperty()
  height: number;
  @ApiProperty()
  bodyType: string;
  @ApiProperty()
  age: number;
  @ApiProperty()
  birthDate: Date;
  @ApiProperty()
  bodyIssue: string;
  @ApiProperty()
  goal: string;
}

export class UpdateBodyDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  weight: number;
  @ApiProperty()
  height: number;
  @ApiProperty()
  bodyType: string;
  @ApiProperty()
  age: number;
  @ApiProperty()
  birthDate: Date;
  @ApiProperty()
  bodyIssue: string;
  @ApiProperty()
  goal: string;
}

