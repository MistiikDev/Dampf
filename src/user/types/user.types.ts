import { Role } from '../../roles/roles.enum';

// User info exported to generate a unique JWT Token (identity)
export type UserPayload = {
  userid: number;
  username: string;

  role: Role;
};
