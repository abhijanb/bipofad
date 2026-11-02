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
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: AuthUser;
};

export type RefreshInput = {
  refresh_token: string;
};

export type MeResponse = {
  message: string;
  user: AuthUser;
};
