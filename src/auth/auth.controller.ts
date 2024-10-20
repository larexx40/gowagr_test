import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, VerifyAccountDto, ResetPasswordDto, RegenerateTokenDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user login.
   * @param {LoginDto} loginDto - The login credentials.
   * @returns {Promise<{status: boolean, message: string, data: any}>} - A promise with the response.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Set HTTP status to 200
  async login(@Body() loginDto: LoginDto): Promise<{ status: boolean; message: string; data: any; }> {
    const result = await this.authService.login(loginDto);
    return {
      status: true,
      message: 'User logged in successfully',
      data: result,
    };
  }

  /**
   * Handles user signup.
   * @param {SignupDto} signupDto - The user signup information.
   * @returns {Promise<{status: boolean, message: string, data: any}>} - A promise with the response.
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED) // Set HTTP status to 201
  async signup(@Body() signupDto: SignupDto): Promise<{ status: boolean; message: string; data: any; }> {
    const result = await this.authService.signup(signupDto);
    return {
      status: true,
      message: 'User created successfully, an OTP has been sent to your email',
      data: result,
    };
  }

  /**
   * Verifies a user's account with the provided OTP.
   * @param {VerifyAccountDto} verifyAccountDto - The verification information.
   * @returns {Promise<{status: boolean, message: string, data: any}>} - A promise with the response.
   */
  @Post('verify-account')
  @HttpCode(HttpStatus.OK) // Set HTTP status to 200
  async verifyAccount(@Body() verifyAccountDto: VerifyAccountDto): Promise<{ status: boolean; message: string; data: any; }> {
    const result = await this.authService.verifyAccount(verifyAccountDto);
    return {
      status: true,
      message: 'OTP verification successful',
      data: result,
    };
  }

  /**
   * Resets a user's password.
   * @param {ResetPasswordDto} resetPasswordDto - The reset password information.
   * @returns {Promise<{status: boolean, message: string, data: any}>} - A promise with the response.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK) // Set HTTP status to 200
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ status: boolean; message: string; data: any; }> {
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
   * @returns {Promise<{status: boolean, message: string, data: any}>} - A promise with the response.
   */
  @Post('regenerate-token')
  @HttpCode(HttpStatus.OK) // Set HTTP status to 200
  async regenerateToken(@Body() regenerateTokenDto: RegenerateTokenDto): Promise<{ status: boolean; message: string; data: any; }> {
    const result = await this.authService.regenerateToken(regenerateTokenDto);
    return {
      status: true,
      message: 'Access token generated successfully',
      data: result,
    };
  }
}
