import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Role } from '../../roles/roles.enum';
import { GameEntity } from '../../games/entity/game.entity';
import { GamePurchaseEntity } from '../../billing/entity/game-purchase.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  userid: number;

  @Column()
  username: string;

  @Column()
  firstname: string;

  @Column({ nullable: true })
  lastname: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: Role.ROLE_PLAYER })
  role: string;

  @Column({ default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GamePurchaseEntity, (game) => game.user)
  ownedGames: GamePurchaseEntity[];

  @OneToMany(() => GameEntity, (game) => game.publisher)
  publishedGames: GameEntity[];
}