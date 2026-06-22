import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext): string | object => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : (request.cookies as object);
  },
);
