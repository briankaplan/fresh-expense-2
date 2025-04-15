export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserWithoutPassword = Omit<User, 'password'>;
