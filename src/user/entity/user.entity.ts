import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
  OneToOne, JoinColumn, ManyToMany, ManyToOne,
} from 'typeorm';

import { Role } from '../../roles/roles.enum';
import { GameEntity } from '../../games/entity/game.entity';
import { GamePurchaseEntity } from '../../billing/entity/game-purchase.entity';
import { UserPrivateEntity } from './user-private.entity';
import { TimestampEntity } from '../../core/generics/timestamp-entity.entity';

@Entity()
export class UserEntity extends TimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  userid: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: Role.ROLE_PLAYER })
  role: Role;

  @OneToOne(() => UserPrivateEntity, (userPrivate) => userPrivate.user)
  private: UserPrivateEntity;

  @OneToMany(() => GameEntity, (game) => game.publisher)
  publishedGames: GameEntity[];

  @OneToMany(() => GamePurchaseEntity, (gamePurchase) => gamePurchase.user)
  ownedGames: GamePurchaseEntity[];
}
