import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GameEntity } from '../../games/entity/game.entity';
import { UserEntity } from '../../user/entity/user.entity';

@Entity()
export class GamePurchaseEntity {
  @PrimaryGeneratedColumn()
  purchase_id: number;

  @Column()
  purchase_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => GameEntity, (game) => game.owners)
  game: GameEntity;

  @ManyToOne(() => UserEntity, (user) => user.ownedGames)
  user: UserEntity;
}