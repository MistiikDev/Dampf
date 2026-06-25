import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EnumPermissions } from '../permissions.enum';
import { UserEntity } from '../../user/entity/user.entity';

@Entity()
export class RoleEntityOld {
  @PrimaryGeneratedColumn()
  roleid: number;

  @Column()
  roleName: string;

  @Column()
  roleDescription: string;

  @Column()
  permissions: EnumPermissions[];

  @ManyToOne(() => UserEntity, (user) => user.role)
  users: UserEntity[];
}
