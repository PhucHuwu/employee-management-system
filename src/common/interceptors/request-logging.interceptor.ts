import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { REQUEST_CONTEXT_KEY } from '../constants/request-context.constant';
import { RequestWithContext } from '../types/request-with-context.type';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithContext>();
    const response = http.getResponse<{ statusCode: number }>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            requestId: request[REQUEST_CONTEXT_KEY]?.requestId,
            method: request.method,
            path: request.originalUrl,
            statusCode: response.statusCode,
            latencyMs: Date.now() - startedAt,
          }),
        );
      }),
    );
  }
}
