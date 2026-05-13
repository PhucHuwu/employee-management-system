import { Request } from 'express';
import { REQUEST_CONTEXT_KEY } from '../constants/request-context.constant';
import { RequestContext } from '../interfaces/request-context.interface';

export type RequestWithContext = Request & {
  [REQUEST_CONTEXT_KEY]?: RequestContext;
};
