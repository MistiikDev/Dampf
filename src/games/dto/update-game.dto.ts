import { PartialType } from '@nestjs/swagger';
import { CreateGameDTO } from './create-game.dto';

export class UpdateGameDTO extends PartialType(CreateGameDTO) {};