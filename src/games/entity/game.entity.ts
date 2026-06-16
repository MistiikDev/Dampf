import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { UserEntity } from '../../user/entity/user.entity';
import { GamePurchaseEntity } from '../../billing/entity/game-purchase.entity';

@Entity()
export class GameEntity {
  @PrimaryGeneratedColumn()
  gameid: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  retail_price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.publishedGames)
  publisher: UserEntity;

  @OneToMany(() => GamePurchaseEntity, (gamePurchase) => gamePurchase.game)
  owners: GamePurchaseEntity[];
}
