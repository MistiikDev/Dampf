import { Reflector } from '@nestjs/core';
import { Role } from '../../roles/roles.enum';

export const Roles = Reflector.createDecorator<Role[]>();
