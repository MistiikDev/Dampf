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

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ type: 'text', nullable: true, array: true })
  refresh_token_blacklist: string[];

  @OneToOne(() => UserEntity, (user) => user.private, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}