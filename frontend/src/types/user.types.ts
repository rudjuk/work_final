export interface User {
  id: number;
  username: string;
  email: string | null;
  fullName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  email?: string | null;
  fullName?: string | null;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  email?: string | null;
  fullName?: string | null;
}

