import { HTTPException } from "hono/http-exception";

export class UnauthorizedException extends HTTPException {
  constructor(message: string = 'Unauthorized Access') {
    const response = Response.json({
      code: 401,
      message: message,
    });
    super(401, { res: response });
  }
}
