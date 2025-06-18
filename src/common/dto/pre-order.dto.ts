import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PreOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly email: string;
}
