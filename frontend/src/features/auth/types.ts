export type AuthUser = {
  username: string;
  email: string;
  isSuperuser?: boolean;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  user?: AuthUser;
};
