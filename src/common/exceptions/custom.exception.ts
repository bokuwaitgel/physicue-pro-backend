import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentNotProcessedException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Payment Not Processed',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
export class ResourceNotFoundException extends HttpException {
  constructor(resource: string) {
    super(
      {
        message: `${resource} олдсонгүй`,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ResourceConflictException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Conflict',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class ValidationFailedException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InsufficientFundException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Insufficient Fund',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
