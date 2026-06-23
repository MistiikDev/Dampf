import { GamesController } from './games.controller';

describe('GamesController', () => {
  let controller: GamesController;
  let mockGameService: any;
  let mockCreateGameDto: any;

  beforeEach(() => {
    mockCreateGameDto = {};
    mockGameService = {
      create: jest.fn(),
    };

    controller = new GamesController(mockGameService);
  });

  describe('POST', () => {
    it('Should return an UNAUTHORIZED error when accessing without session', async () => {});
  });
});
