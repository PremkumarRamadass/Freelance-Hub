export type UserRole = 'ADMIN' | 'FREELANCER' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  title?: string;
  companyName?: string;
  hourlyRate?: number;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  title?: string;
  companyName?: string;
  hourlyRate?: number;
  phone?: string;
  passcode?: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  companyName?: string;
  hourlyRate?: number;
  location?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordChangeResult {
  success: boolean;
  message: string;
}
