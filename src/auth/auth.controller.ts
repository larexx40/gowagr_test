import { Body, Controller, Post, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, VerifyAccountDto, ResetPasswordDto, RegenerateTokenDto, SendOtpDto } from './dto/auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Handles user login.
   * 
   * @param {LoginDto} loginDto - The login credentials.
   * @returns {Promise<{status: boolean, message: string, data:  { accessToken: string; refreshToken: string; user: User; }}>} - A promise with the response.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password, return user data and JWT ' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<{ status: boolean; message: string; data: { accessToken: string; refreshToken: string; user: User }; }> {
    const result = await this.authService.login(loginDto);
    return {
      status: true,
      message: 'User logged in successfully',
      data: result,
    };
  }

  /**
   * Handles user signup.
   * 
   * @param {SignupDto} signupDto - The user signup information.
   * @returns {Promise<{status: boolean, message: string, data: User}>} - A promise with the response.
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Signup using email, password and other biodata' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Signup successful' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Account with email/username already exists"' })
  async signup(@Body() signupDto: SignupDto): Promise<{ status: boolean; message: string; data: User; }> {
    const result = await this.authService.signup(signupDto);
    return {
      status: true,
      message: 'User created successfully, an OTP has been sent to your email',
      data: result,
    };
  }

  /**
   * Verifies a user's account with the provided OTP.
   * 
   * @param {VerifyAccountDto} verifyAccountDto - The verification information.
   * @returns {Promise<{status: boolean, message: string, data:  { accessToken: string; refreshToken: string; user: User}}>} - A promise with the response.
   */
  @Post('verify-account')
  @HttpCode(HttpStatus.OK) 
  @ApiOperation({ summary: 'Verify newly registered account using 6 digit otp' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Verification successful' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account with email not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid OTP or expired ' })
  async verifyAccount(@Body() verifyAccountDto: VerifyAccountDto): Promise<{ status: boolean; message: string; data: { accessToken: string; refreshToken: string; user: User }; }> {
    const result = await this.authService.verifyAccount(verifyAccountDto);
    return {
      status: true,
      message: 'OTP verification successful',
      data: result,
    };
  }

  /**
   * Resend verification OTP to the user's email.
   * 
   * @param {SendOtpDto} resendOtpDto - DTO containing the user's email.
   * @returns {Promise<{status: boolean, message: string, data: User}>} - The response containing status, message, and user data.
   * @example
   * POST /auth/resend-otp
   */
  @Post('resend-verification-otp')
  @HttpCode(HttpStatus.OK) 
  @ApiOperation({ summary: 'Resend verification OTP in case lost or expired' })
  @ApiResponse({ status: HttpStatus.OK, description: 'OTP sent via mail' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account with email not found' })
  async resendVerificationOtp(@Body() resendOtpDto: SendOtpDto): Promise<{ status: boolean; message: string; data: User; }> {
    const result = await this.authService.resendVerificationOtp(resendOtpDto);
    return {
      status: true,
      message: 'New verification OTP sent',
      data: result,
    };
  }

  /**
  * Endpoint to handle password reset request by generating and sending a reset OTP.
  * 
  * @param {SendOtpDto} forgotPasswordDto - Contains the user's email for password reset.
  * @returns {Promise<{status: boolean, message: string, data: any}>} - A promise with the response containing the status, message, and OTP data.
  * 
  * 
  * @throws {NotFoundException} If the email does not exist.
  */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK) 
  @ApiOperation({ summary: 'Generate a password reset OTP and send it to the user\'s email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reset token sent to your email' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account with email not found' })
  async forgotPassword(
    @Body() forgotPasswordDto: SendOtpDto,
  ): Promise<{ status: boolean; message: string; data: User }> {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return {
      status: true,
      message: 'Reset token sent to your email',
      data: result,
    };
  }


  /**
   * Resets a user's password.
   * @param {ResetPasswordDto} resetPasswordDto - The reset password information.
   * @returns {Promise<{status: boolean, message: string, data: User}>} - A promise with the response.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with 6 digit OTP and new password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset successful' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account with email not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid OTP or expired ' })
  async resetPass(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<{ status: boolean; message: string; data: User; }> {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return {
      status: true,
      message: 'Password reset successful',
      data: result,
    };
  }

  /**
   * Regenerates an access token using a refresh token.
   * @param {RegenerateTokenDto} regenerateTokenDto - The refresh token information.
   * @returns {Promise<{status: boolean, message: string, data:  { accessToken: string; refreshToken: string; }}>} - A promise with the response.
   */
  @Post('regenerate-token')
  @HttpCode(HttpStatus.OK) 
  @ApiOperation({ summary: 'Reset password with 6 digit OTP and new password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset successful' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account with email not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid OTP or expired ' })
  async regenerateToken(@Body() regenerateTokenDto: RegenerateTokenDto): Promise<{ status: boolean; message: string; data: { accessToken: string; refreshToken: string; }; }> {
    const result = await this.authService.regenerateToken(regenerateTokenDto);
    return {
      status: true,
      message: 'Access token generated successfully',
      data: result,
    };
  }
}
