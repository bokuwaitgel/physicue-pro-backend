import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly amount: number;
  @ApiProperty()
  courseId: string;
  @ApiProperty()
  deeplink: string;
}
export class CheckInvoiceDto {
  @ApiProperty()
  @IsNotEmpty()
  invoiceId: string;
}