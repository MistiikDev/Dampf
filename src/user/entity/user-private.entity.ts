import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class UserPrivateEntity {
  @PrimaryGeneratedColumn()
  userPrivateId: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  balance: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToOne(() => UserEntity, (user) => user.private)
  @JoinColumn()
  user: UserEntity;
}