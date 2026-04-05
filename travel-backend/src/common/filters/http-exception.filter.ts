import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          status = HttpStatus.CONFLICT;
          message = `Unique constraint failed: ${(exception.meta as any)?.target?.join(', ') || 'unknown field'}`;
          break;
        case 'P2025': // Record to update not found
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003': // Foreign key constraint failed
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Database Error: ${exception.message}`;
          break;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${Array.isArray(message) ? message.join(', ') : message}`,
      exception instanceof Error ? exception.stack : '',
    );

    const errorMessage = Array.isArray(message) ? message[0] : message;

    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
