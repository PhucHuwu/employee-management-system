import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { REQUEST_CONTEXT_KEY } from '../constants/request-context.constant';
import { REQUEST_ID_HEADER } from '../constants/request-id.constant';
import { RequestWithContext } from '../types/request-with-context.type';
import { generateRequestId } from '../utils/request-id.util';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithContext, res: Response, next: NextFunction): void {
    const rawRequestId = req.header(REQUEST_ID_HEADER);
    const requestId = rawRequestId && rawRequestId.trim() ? rawRequestId : generateRequestId();

    req[REQUEST_CONTEXT_KEY] = { requestId };
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
