import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entity/user.entity';
import { UserPrivateEntity } from './entity/user-private.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserPrivateEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})

export class UserModule {}
