import { ErrorResponse } from '@common/interfaces';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  constructor(
    @InjectPinoLogger(HttpExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionStatus = exception.getStatus();
    const getResponse = exception.getResponse();
    const exceptionResponse =
      typeof getResponse === 'string' ? { message: getResponse } : getResponse;

    const ErrorResponseBody: ErrorResponse = {
      ...exceptionResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(exceptionStatus).json(ErrorResponseBody);
  }
}
