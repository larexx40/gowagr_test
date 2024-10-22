import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, VerifyAccountDto, ResetPasswordDto, RegenerateTokenDto, SendOtpDto } from './dto/auth.dto';
import { User } from 'src/users/entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const user: User = { 
    id: 'user-id', 
    email: 'test@example.com', 
    username: 'testUser'
   } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            signup: jest.fn(),
            verifyAccount: jest.fn(),
            resendVerificationOtp: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            regenerateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return login response with access and refresh tokens and user data', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const tokenData = { accessToken: 'access_token', refreshToken: 'refresh_token', user };

      jest.spyOn(authService, 'login').mockResolvedValue(tokenData);

      const result = await authController.login(loginDto);

      expect(result).toEqual({
        status: true,
        message: 'User logged in successfully',
        data: tokenData,
      });
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('signup', () => {
    it('should return signup response with user data and confirmation message', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com', 
        password: 'password', 
        firstname: 'Larry',
        lastname: 'Doe',
        username: 'testUser',
      };

      jest.spyOn(authService, 'signup').mockResolvedValue(user);

      const result = await authController.signup(signupDto);

      expect(result).toEqual({
        status: true,
        message: 'User created successfully, an OTP has been sent to your email',
        data: user,
      });
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('verifyAccount', () => {
    it('should return verification success with tokens and user data', async () => {
      const verifyAccountDto: VerifyAccountDto = { 
        email: 'test@example.com', 
        otp: 123456 

      };
      const user: User = { id: '1', email: 'test@example.com', username: 'testUser' } as User;
      const tokenData = { accessToken: 'access_token', refreshToken: 'refresh_token', user };

      jest.spyOn(authService, 'verifyAccount').mockResolvedValue(tokenData);

      const result = await authController.verifyAccount(verifyAccountDto);

      expect(result).toEqual({
        status: true,
        message: 'OTP verification successful',
        data: tokenData,
      });
      expect(authService.verifyAccount).toHaveBeenCalledWith(verifyAccountDto);
    });
  });

  describe('resendVerificationOtp', () => {
    it('should return OTP resend success with user data', async () => {
      const resendOtpDto: SendOtpDto = { email: 'test@example.com' };

      jest.spyOn(authService, 'resendVerificationOtp').mockResolvedValue(user);

      const result = await authController.resendVerificationOtp(resendOtpDto);

      expect(result).toEqual({
        status: true,
        message: 'New verification OTP sent',
        data: user,
      });
      expect(authService.resendVerificationOtp).toHaveBeenCalledWith(resendOtpDto);
    });
  });

  describe('forgotPassword', () => {
    it('should send a reset token to the user\'s email', async () => {
      const forgotPasswordDto: SendOtpDto = { email: 'test@example.com' };

      jest.spyOn(authService, 'forgotPassword').mockResolvedValue(user);

      const result = await authController.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({
        status: true,
        message: 'Reset token sent to your email',
        data: user,
      });
      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    });
  });

  describe('resetPassword', () => {
    it('should reset the user\'s password', async () => {
      const resetPasswordDto: ResetPasswordDto = { 
        email: 'test@example.com', 
        otp: 123456, 
        newPassword: 'newPassword' 
      };

      jest.spyOn(authService, 'resetPassword').mockResolvedValue(user);

      const result = await authController.resetPass(resetPasswordDto);

      expect(result).toEqual({
        status: true,
        message: 'Password reset successful',
        data: user,
      });
      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });

  describe('regenerateToken', () => {
    it('should regenerate access and refresh tokens', async () => {
      const regenerateTokenDto: RegenerateTokenDto = { 
        refreshToken: 'refresh_token' 
      };
      const tokenData = { 
        accessToken: 'new_access_token', 
        refreshToken: 'new_refresh_token', 
        user 
      };

      jest.spyOn(authService, 'regenerateToken').mockResolvedValue(tokenData);

      const result = await authController.regenerateToken(regenerateTokenDto);

      expect(result).toEqual({
        status: true,
        message: 'Access token generated successfully',
        data: tokenData,
      });
      expect(authService.regenerateToken).toHaveBeenCalledWith(regenerateTokenDto);
    });
  });
});
