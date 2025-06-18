import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (typeof response === 'string') {
          return {
            success: true,
            message: response,
          };
        }

        return {
          success: true,
          message: response.message || 'Operation successful',
          ...(response.hasOwnProperty('data') && { data: response.data }), // Include data even if it's 0
        };
      }),
    );
  }
}
