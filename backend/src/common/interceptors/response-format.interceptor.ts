import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { REQUEST_CONTEXT_KEY } from '../constants/request-context.constant';
import { RequestWithContext } from '../types/request-with-context.type';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithContext>();

    return next.handle().pipe(
      map((data: unknown) => ({
        success: true,
        data,
        requestId: request[REQUEST_CONTEXT_KEY]?.requestId,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
