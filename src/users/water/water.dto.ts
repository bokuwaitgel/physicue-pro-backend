import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';


export class CreateWaterDto {
  @ApiProperty()
  @IsNotEmpty()
  waterIntake: number;
  @ApiProperty()
  @IsNotEmpty()
  userId: string;
}