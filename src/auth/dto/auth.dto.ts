import { IsEmail, IsNotEmpty, IsNumberString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class SignupDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;
  
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
  
    @IsNotEmpty({ message: 'Full name is required' })
    fullName: string;
}

export class VerifyAccountDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;
    
    @IsNotEmpty({ message: 'OTP is required' })
    @IsNumberString({}, { message: 'OTP must be a valid number' })
    @Length(6, 6, { message: 'OTP must be exactly 6 digits long' })
    otp: number;
}

export class ResetPasswordDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;
  
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(6, { message: 'New password must be at least 6 characters long' })
    newPassword: string;
}

export class VerifyResetOtpDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;
  
    @IsNotEmpty({ message: 'OTP is required' })
    @IsNumberString({}, { message: 'OTP must be a valid number' })
    @Length(6, 6, { message: 'OTP must be exactly 6 digits long' })
    otp: number;
}

export class RegenerateTokenDto {
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken: string;
}
