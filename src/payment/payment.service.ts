import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
    constructor(private prisma: PrismaService) {}
    
    // async createInvoice(amount: number, orderId: string) {
    //     try {
    //     const invoice = await this.prisma.invoice.create({
    //         data: {
    //         amount,
    //         orderId,
    //         },
    //     });
    //     return {
    //         status: true,
    //         type: 'success',
    //         message: 'Invoice created successfully',
    //         code: 201,
    //         data: invoice,
    //     };
    //     } catch (error) {
    //     return {
    //         status: false,
    //         type: 'error',
    //         message: 'Failed to create invoice',
    //         code: 500,
    //     };
    //     }
    // }
}
