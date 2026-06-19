import { UserService } from './user.service';
import { HttpException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepo: any;
  let mockUserPrivateRepo: any;

  beforeEach(() => {
    mockUserRepo = {
      save: jest.fn(),
    };

    mockUserPrivateRepo = {
      save: jest.fn(),
    };
    service = new UserService(mockUserRepo, mockUserPrivateRepo);
  });

  it('Cannot save if user email already is registered', async () => {

  });
});
