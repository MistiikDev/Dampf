import { GamesService } from './games.service';
import { ForbiddenException, HttpException } from '@nestjs/common';

describe('GamesService', () => {
  let service: GamesService;
  let mockGameRepository: any;
  let mockUserService: any;
  let mockCreateGameDTO: any;

  beforeEach(() => {
    mockCreateGameDTO = {};
    mockGameRepository = {
      findEntry: jest.fn(),
      save: jest.fn(),
    };

    mockUserService = {
      findEntry: jest.fn(),
    };

    service = new GamesService(mockGameRepository, mockUserService);
  });

  describe('create', () => {
    it('Should return an error, PLAYER cannot publish games', async () => {
      mockUserService.findEntry.mockResolvedValue({
        userid: '1',
        role: 'player',
      });

      await expect(service.create('1', mockCreateGameDTO)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Should return an error, GAME must be original', async () => {
      mockUserService.findEntry.mockResolvedValue({
        userid: '1',
        role: 'publisher',
      });

      mockGameRepository.save.mockImplementation(() => {
        throw new Error();
      });

      await expect(service.create('1', mockCreateGameDTO)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
