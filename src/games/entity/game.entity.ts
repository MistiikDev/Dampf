import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { UserEntity } from '../../user/entity/user.entity';
import { GamePurchaseEntity } from '../../billing/entity/game-purchase.entity';
import { TimestampEntity } from '../../core/generics/timestamp-entity.entity';

@Entity()
export class GameEntity extends TimestampEntity {
  @PrimaryGeneratedColumn()
  gameid: number;

  @Column({ unique: true })
  title: string;

  @Column()
  description: string;

  @Column()
  retail_price: number;

  @ManyToOne(() => UserEntity, (user) => user.publishedGames, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ foreignKeyConstraintName: 'publisher_user_id' })
  publisher: UserEntity;

  @OneToMany(() => GamePurchaseEntity, (gamePurchase) => gamePurchase.game)
  owners: GamePurchaseEntity[];
}
