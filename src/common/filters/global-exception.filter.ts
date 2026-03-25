import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { REQUEST_CONTEXT_KEY } from '../constants/request-context.constant';
import { RequestWithContext } from '../types/request-with-context.type';

interface ErrorPayload {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithContext>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? (exception.getResponse() as ErrorPayload | string)
        : undefined;

    const normalizedError = this.normalizeError(status, errorResponse);
    const requestId = request[REQUEST_CONTEXT_KEY]?.requestId;

    response.status(status).json({
      success: false,
      code: normalizedError.code,
      message: normalizedError.message,
      details: normalizedError.details,
      requestId,
      timestamp: new Date().toISOString(),
      path: (request as Request).originalUrl,
    });
  }

  private normalizeError(status: number, errorResponse: ErrorPayload | string | undefined): {
    code: string;
    message: string;
    details?: string[];
  } {
    const code = `HTTP_${status}`;

    if (typeof errorResponse === 'string') {
      return { code, message: errorResponse };
    }

    if (!errorResponse) {
      return { code, message: 'Internal server error' };
    }

    if (Array.isArray(errorResponse.message)) {
      return {
        code,
        message: errorResponse.error ?? 'Validation failed',
        details: errorResponse.message,
      };
    }

    return {
      code,
      message: errorResponse.message ?? errorResponse.error ?? 'Request failed',
    };
  }
}
