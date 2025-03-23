import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSleepDto {
  @ApiProperty()
  @IsNotEmpty()
  sleepTime: Date;
  @ApiProperty()
  @IsNotEmpty()
  wakeTime: Date;
  @ApiProperty()
  @IsNotEmpty()
  userId: string;
}
