import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { LoginDto, SignupDto, VerifyAccountDto, ResetPasswordDto, VerifyResetOtpDto, RegenerateTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.authRepository.findByEmail(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id, email },
      { expiresIn: process.env.ACCESS_TOKEN_TTL }
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id, email },
      { expiresIn: process.env.REFRESH_TOKEN_TTL }
    );

    return { accessToken, refreshToken };
  }

  async signup(signupDto: SignupDto) {
    const { email, password, fullName } = signupDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.authRepository.createUser({
      email,
      password: hashedPassword,
      fullName,
    });
    return user;
  }

  async verifyAccount(verifyAccountDto: VerifyAccountDto) {
    // Verification logic
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Reset password logic
  }

  async verifyResetOtp(verifyResetOtpDto: VerifyResetOtpDto) {
    // OTP verification logic
  }

  async regenerateToken(regenerateTokenDto: RegenerateTokenDto) {
    const { refreshToken } = regenerateTokenDto;
    try {
      const { sub, email } = this.jwtService.verify(refreshToken);
      const accessToken = this.jwtService.sign({ sub, email }, { expiresIn: '1d' });
      return { accessToken };
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }
}
