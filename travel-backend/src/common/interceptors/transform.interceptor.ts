import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        
        // Cố gắng tùy biến message nếu service return một structure cụ thể có format `{ rawData, message }`
        // Nhưng ở đây theo yêu cầu Service trả về Raw Data hoàn toàn, ta tự set message.
        // Tuy nhiên, có thể support bằng cách check.
        let returnData = data;
        let message = 'Success';

        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
           message = data.message;
           returnData = data.data;
        }

        return {
          statusCode: response.statusCode,
          message,
          data: returnData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
