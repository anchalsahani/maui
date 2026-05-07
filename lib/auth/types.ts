export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface StoredUser extends AuthUser {
  passwordHash: string;
  passwordSalt: string;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
}

