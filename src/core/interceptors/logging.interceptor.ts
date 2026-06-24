import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const before: number = Date.now();

    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const timeStamp: string = new Date().toUTCString();

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `[${timeStamp}] ${req.method} ${req.url} (${Date.now() - before} ms) - ${res.statusCode}`,
          ),
        ),
      );
  }
}
