import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class BillingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const date = new Date();
    console.log(`Processed purchased @${date.toISOString()}\n`);

    next();
  }
}
