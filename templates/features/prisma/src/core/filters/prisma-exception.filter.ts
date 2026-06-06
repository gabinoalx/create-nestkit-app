import { ErrorResponse } from '@common/interfaces';
import {
  ArgumentsHost,
  ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<PrismaClientKnownRequestError> {
  constructor(
    @InjectPinoLogger(PrismaExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorMap: Record<string, keyof typeof HttpErrorByCode> = {
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
      P2003: HttpStatus.BAD_REQUEST,
    };

    const httpStatusCode =
      errorMap[exception.code] || HttpStatus.INTERNAL_SERVER_ERROR;
    const httpException = new HttpErrorByCode[
      httpStatusCode
    ]() as HttpException;

    const getResponse = httpException.getResponse();
    const error =
      typeof getResponse === 'string' ? { message: getResponse } : getResponse;

    const errorResponseBody: ErrorResponse = {
      ...error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(httpStatusCode).json(errorResponseBody);
  }
}
