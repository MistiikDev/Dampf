import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { Role } from '../../roles/roles.enum';
import { GameEntity } from '../../games/entity/game.entity';
import { GamePurchaseEntity } from '../../billing/entity/game-purchase.entity';
import { UserPrivateEntity } from './user-private.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  userid: number;

  @Column()
  username: string;

  @Column({ default: Role.ROLE_PLAYER })
  role: string;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @UpdateDateColumn({ default: new Date() })
  updatedAt: Date;

  @OneToOne(() => UserPrivateEntity, (userPrivate) => userPrivate.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  private: UserPrivateEntity;

  @OneToMany(() => GamePurchaseEntity, (game) => game.user)
  ownedGames: GamePurchaseEntity[];

  @OneToMany(() => GameEntity, (game) => game.publisher)
  publishedGames: GameEntity[];
}