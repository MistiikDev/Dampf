import { Reflector } from '@nestjs/core';
import { EnumPermissions } from '../../roles/permissions.enum';

export const RequirePermission = Reflector.createDecorator<EnumPermissions[]>();
