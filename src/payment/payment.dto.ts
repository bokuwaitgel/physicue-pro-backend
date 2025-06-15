import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly amount: number;

  @ApiProperty()
  @IsNotEmpty()
  readonly orderId: string;
}

