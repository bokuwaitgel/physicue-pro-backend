import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      message =
        typeof errorResponse === 'object'
          ? errorResponse['message']
          : errorResponse;
      error =
        typeof errorResponse === 'object' ? errorResponse['error'] : 'Error';
    } else if (exception instanceof Error) {
      message = exception.message || 'Internal server error';
      error = 'Error';
    } else {
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    response.status(status).json({
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
