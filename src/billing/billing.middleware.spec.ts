import { BillingMiddleware } from './billing.middleware';

describe('BillingMiddleware', () => {
  it('should be defined', () => {
    expect(new BillingMiddleware()).toBeDefined();
  });
});
