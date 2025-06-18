import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { CheckInvoiceDto, CreateInvoiceDto } from './payment.service.dto';
import { PaymentStatus, Prisma } from '@prisma/client';
// import { FirebaseNotificationService } from 'src/notification/notification.service';
import {
  PaymentNotProcessedException,
  ResourceConflictException,
} from 'src/common/exceptions/custom.exception';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    // private notificationService: FirebaseNotificationService,
  ) {}
  private readonly apiUrl = 'https://merchant.qpay.mn/v2';
  private authToken: string | null = null;

  async getAuthToken(): Promise<any> {
    try {
      const requestConfig = {
        url: `${this.apiUrl}/auth/token`,
        method: 'POST',
        auth: {
          username: process.env.QPAY_USERNAME || '',
          password: process.env.QPAY_PASSWORD || '',
        },
      };

      return axios(requestConfig)
        .then(async (response) => {
          
          const res = {
            access_token: response.data['access_token'],
            refresh_token: response.data['refresh_token'],
            expires_in: response.data['expires_in'],
            refresh_expires_in: response.data['refresh_expires_in'],
          };

          // Save the token to the database
          const token = await this.prisma.qPayToken.findFirst({
            where: {
              paymentId: '1', // Assuming you have a single token for the application
            },
          });


          if (token) {
            await this.prisma.qPayToken.update({
              where: { id: token.id },
              data: {
                accessToken: res.access_token,
                refreshToken: res.refresh_token,
                expiresIn: res.expires_in,
                refreshExpiresIn: res.refresh_expires_in,
              },
            });
          } else {
            await this.prisma.qPayToken.create({
              data: {
                paymentId: '1', // Assuming you have a single token for the application
                accessToken: res.access_token,
                refreshToken: res.refresh_token,
                expiresIn: res.expires_in,
                refreshExpiresIn: res.refresh_expires_in,
              },
            });
          }
          
          return {
            status: true,
            type: 'success',
            code: HttpStatus.OK,
            data: res,
          };
        })
        .catch((error) => {
          console.log(error);
          return {
            status: false,
            type: 'error',
            code: HttpStatus.INTERNAL_SERVER_ERROR,
          };
        });
    } catch (error) {
      throw new Error('Failed to obtain authentication token');
    }
  }

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    userId: string,
  ): Promise<any> {
    try {
      const paymentModel = await this.prisma.payment.create({
        data: {
          User: {
            connect: {
              id: userId,
            },
          },
          amount: createInvoiceDto.amount,
        },
      });

      const postData = {
        invoice_code: 'GRAND_PHYSIQUE_INVOICE',
        sender_invoice_no: '1234567',
        invoice_receiver_code: 'PHYSIQUE_PRO',
        invoice_description: 'PHYSIQUE_PRO',
        sender_branch_code: 'App',
        amount: createInvoiceDto.amount,
        callback_url: `http://64.227.140.24:3000/api/payment/verify/${paymentModel.id}/${userId}`,
      };
      const url = `${this.apiUrl}/invoice`;

      const token = await this.prisma.qPayToken.findFirst({
        where: {
          paymentId: '1',
        },
      });
      let bearerToken = '';
      if(!token) {
        const res = await this.getAuthToken();

        bearerToken = res.data.access_token;
      } else {
        bearerToken = token.accessToken;
      }

      const headers = {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      };
      return axios
        .post(url, postData, { headers })
        .then(async (response) => {
          await this.prisma.payment.update({
            where: {
              id: paymentModel.id,
            },
            data: {
              invoiceId: response.data.invoice_id,
            },
          });
          return {
            status: true,
            type: 'success',
            code: HttpStatus.OK,
            data: response.data,
          };
        })
        .catch(async (error) => {
          if (error.response && error.response.status === 401) {
            await this.getAuthToken();
            return await this.createInvoice(createInvoiceDto, userId);
          }
          throw new Error(`${error}`);
        });
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async checkInvoice(invoiceId: string): Promise<any> {
    console.log('Checking Invoice:', invoiceId);
    const postData = {
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    };
    const url = `${this.apiUrl}/payment/check`;



    const token = await this.prisma.qPayToken.findFirst(
      {
        where: {
          paymentId: '1', // Assuming you have a single token for the application
        },
      },
    );
    if (!token) {
      throw new HttpException('QPay token not found', HttpStatus.UNAUTHORIZED);
    }
    const bearerToken = token.accessToken;
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    };
    return axios
      .post(url, postData, { headers })
      .then((response) => {
        return {
          status: true,
          type: 'success',
          code: HttpStatus.OK,
          data: response.data,
        };
      })
      .catch(async (error) => {
        if (error.response && error.response.status === 401) {
          await this.getAuthToken();
          return await this.checkInvoice(invoiceId);
        }
        throw new Error(`${error}`);
      });
  }

  async verifyInvoice(
    paymentId: string,
    userId: string,
  ): Promise<any> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
      },
      include: {
        User: true,
      },
    });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    if (payment.User.id !== userId) {
      throw new ResourceConflictException(
        'You do not have permission to verify this payment',
      );
    }

    const checkInvoiceDto: CheckInvoiceDto = {
      invoiceId: payment.invoiceId,
    };

    const response = await this.checkInvoice(checkInvoiceDto.invoiceId);
    if (response.data.count > 0) {
      const transaction = await this.prisma.$transaction(
        async (tx) => {
          const updatedPayment = await tx.payment.updateMany({
            where: {
              id: paymentId,
              status: PaymentStatus.PENDING,
            },
            data: {
              status: PaymentStatus.SUCCESS,
            },
          });

          if (updatedPayment.count == 0) {
            throw new ResourceConflictException(
              `Баталгаажсан гүйлгээ байна.`,
            );
          }
        }
      );
      return transaction;
    } else {
      throw new PaymentNotProcessedException(`Төлбөр хийгдээгүй байна.`);
    }
  } 
}