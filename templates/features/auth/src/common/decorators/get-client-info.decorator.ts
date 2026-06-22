import { ClientInfo } from '@common/interfaces';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetClientInfo = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): ClientInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const userAgent = request.headers['user-agent'] || 'Unknown';
    let ipAddress: string;
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) ipAddress = (forwardedFor as string).split(',')[0].trim();
    else if (request.headers['x-real-ip'])
      ipAddress = request.headers['x-real-ip'] as string;
    else ipAddress = request.ip || request.socket.remoteAddress || 'Unknown';
    return { userAgent, ipAddress };
  },
);
