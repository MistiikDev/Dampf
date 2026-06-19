import { AuthService } from './auth.service';
import { HttpException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: any;
  let mockJwtService: any;
  let mockResponse: any;

  beforeEach(() => {
    // Create fake repo
    mockUserService = {
      findEntry: jest.fn(),
    };

    mockJwtService = {
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
    };

    mockResponse = {};

    service = new AuthService(mockUserService, mockJwtService);
  });

  describe('login', () => {
    // USER NOT FOUND UNIT TEST
    it('Should return 404 if user is not found', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      mockUserService.findEntry.mockResolvedValue(null);
      const result = await service.login('userDoesNotExist', 'x', mockResponse);

      await expect(result).rejects.toThrow(HttpException);
    });
  });
});
