import { type ExecutionContext, createParamDecorator } from "@nestjs/common";
import type { Request } from "express";

export const CurrentUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.user;

  if (!user) {
    return null;
  }

  return data ? user[data] : user;
});
