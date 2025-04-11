import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class RegisterDto extends LoginDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email' })
  email?: string;
} 