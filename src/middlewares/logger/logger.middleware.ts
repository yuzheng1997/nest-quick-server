import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request } from 'express';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    next();
  }
}
