import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Put,
    Post,
    Request,
    UseGuards,
    UseInterceptors,
    Param,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { PaymentService } from './payment.service';
  import { CheckInvoiceDto, CreateInvoiceDto } from './payment.service.dto';
  import { Throttle } from '@nestjs/throttler';
  
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiTags('payment')
  @Controller('payment')
  export class PaymentController {
    constructor(private paymentService: PaymentService) {}
  
    // @UseGuards(JwtAuthGuard)
    // @UseInterceptors(ClassSerializerInterceptor)
    // @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('createInvoice')
    public async createInvoice(
      @Body() createInvoiceDto: CreateInvoiceDto,
      @Request() req,
    ): Promise<any> {
      return await this.paymentService.createInvoice(
        createInvoiceDto,
        req.user.id,
      );
    }
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('checkInvoice')
    public async checkInvoice(
      @Body() checkInvoiceDto: CheckInvoiceDto,
      @Request() req,
    ): Promise<any> {
      return await this.paymentService.checkInvoice(checkInvoiceDto.invoiceId);
    }
  
    @Get('verify/:paymentId/:userId')
    public async verifyInvoice(
      @Param('paymentId') invoiceId: string,
      @Param('userId') userId: string,
    ) {
      console.log('Verifying payment:', invoiceId, 'for user:', userId);
      return await this.paymentService.verifyInvoice(invoiceId, userId);
    }

    @Get('checkPayment/:invoiceId')
    public async checkPaymentWithInvoice(
      @Param('invoiceId') invoiceId: string,
    ): Promise<any> {
      console.log('Checking payment with invoice:', invoiceId);
      return await this.paymentService.checkPaymentWithInvoice(invoiceId);
    }


  }