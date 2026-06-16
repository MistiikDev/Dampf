import { Role } from '../../roles/roles.enum';

// Default User Info used in backend
export type User = {
  userid: number;
  username: string;
  password: string;

  firstname: string;
  lastname: string;

  email: string;
  role: Role;
};

// User info exported to generate a unique JWT Token (identity)
export type UserPayload = {
  userid: number;
  username: string;

  role: Role;
};
