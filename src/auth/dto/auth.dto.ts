import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    Length,
    Matches,
    MinLength,
} from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'The user\'s email address',
        example: 'user@example.com',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @ApiProperty({
        description: 'The user\'s password',
        example: 'Password123!',
    })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}

export class SignupDto {
    @ApiProperty({
        description: 'The user\'s email address',
        example: 'user@example.com',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({
        description: 'The user\'s first name',
        example: 'Lanre',
    })
    @IsNotEmpty({ message: 'First name is required' })
    @IsString({ message: 'Firstname must be a valid string' })
    firstname: string;

    @ApiProperty({
        description: 'The user\'s last name',
        example: 'Doe',
    })
    @IsNotEmpty({ message: 'Last name is required' })
    @IsString({ message: 'Lastname must be a valid string' })
    lastname: string;

    @ApiProperty({
        description: 'The user\'s username',
        example: 'Lanre_doe',
    })
    @IsNotEmpty({ message: 'Username is required' })
    @IsString({ message: 'Username must be a valid string' })
    username: string;

    @ApiProperty({
        description: 'The user\'s password. Must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        example: 'Password123!',
    })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a valid string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    password: string;
}

export class VerifyAccountDto {
    @ApiProperty({
        description: 'The user\'s email address',
        example: 'user@example.com',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @ApiProperty({
        description: 'The verification OTP sent to the user\'s email',
        example: '123456',
    })
    @IsNotEmpty({ message: 'OTP is required' })
    @IsNumber({}, { message: 'OTP must be a valid number' })
    // @Length(6, 6, { message: 'OTP must be exactly 6 digits long' })
    otp: number;
}

export class SendOtpDto {
    @ApiProperty({
        description: 'The user\'s email address',
        example: 'user@example.com',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty({
        description: 'The user\'s email address',
        example: 'user@example.com',
    })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @ApiProperty({
        description: 'The new password for the user account',
        example: 'NewPassword123!',
    })
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(6, { message: 'New password must be at least 6 characters long' })
    newPassword: string;

    @ApiProperty({
        description: 'The OTP used for password reset',
        example: '123456',
    })
    @IsNotEmpty({ message: 'OTP is required' })
    @IsNumber({}, { message: 'OTP must be a valid number' })
    // @Length(6, 6, { message: 'OTP must be exactly 6 digits long' })
    otp?: number;
}

export class ForgotPassword {
    @ApiProperty({
        description: 'The user\'s email address for password recovery',
        example: 'user@example.com',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;
}

export class VerifyResetOtpDto {
    @ApiProperty({
        description: 'The user\'s email address',
        example: 'user@example.com',
    })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @ApiProperty({
        description: 'The OTP for verifying the password reset',
        example: '123456',
        required: false, // Make this property optional
    })
    @IsOptional()
    @IsNumberString({}, { message: 'OTP must be a valid number' })
    @Length(6, 6, { message: 'OTP must be exactly 6 digits long' })
    otp?: number;

    @ApiProperty({
        description: 'The hashed OTP for verifying the password reset',
        example: 'hashedOtpValue',
        required: false, // Make this property optional
    })
    @IsOptional()
    @IsString({ message: 'Hashed OTP must be a valid string' })
    hashOtp?: string;
}

export class RegenerateTokenDto {
    @ApiProperty({
        description: 'The refresh token used to regenerate access token',
        example: 'refreshTokenValue',
    })
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken: string;
}
