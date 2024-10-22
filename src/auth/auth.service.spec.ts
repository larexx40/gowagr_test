import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginDto, SignupDto, VerifyAccountDto,  } from './dto/auth.dto';
import { User } from 'src/users/entities/user.entity';
import { generateOtp, otpExpired } from 'src/utils/helpers';

// Mock helper functions
jest.mock('../utils/helpers.ts', () => ({
  generateOtp: jest.fn().mockReturnValue(123456), // Mocking generateOtp to return 123456
  otpExpired: jest.fn().mockReturnValue(false),   // Mocking otpExpired to return false
}));

// mock bcrypt and jwt they are used in AuthService
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue('password')
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));


describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: AuthRepository;

  const userId = 'valid-user-id';
  let user: User = {
    id: userId,
    email: 'larexx40@gmail.com',
    password: 'hashedPassword',
    isVerified: true,
    username: 'lanre_doe',
    firstname: 'lanre',
    lastname: 'doe',
    balance: 0,
    verificationOtp: 0,
    otpExpiresIn: undefined,
    passwordResetOtp: 0,
    passwordResetOtpExpiresIn: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    transactions: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            findByEmail: jest.fn(),
            findUser: jest.fn(),
            createUser: jest.fn(),
            updateUserData: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return accessToken, refreshToken, and user if credentials are valid', async () => {
      const loginDto: LoginDto = { 
        email: 'test@example.com', 
        password: 'password' 
      };
      
       // Mocking the repository and bcrypt
       jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(user);
       jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
       (jwt.sign as jest.Mock)
       .mockReturnValueOnce('access-token') // First call returns access token
       .mockReturnValueOnce('refresh-token'); // Second call returns refresh token


       const result = await authService.login(loginDto);

       expect(result).toEqual({
           accessToken: 'access-token',
           refreshToken: 'refresh-token',
           user,
       });
       expect(authRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
       expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
       expect(jwt.sign).toHaveBeenCalledTimes(2); // Once for accessToken, once for refreshToken
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if account is not verified', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const unverifiedUser: User = { ...user, isVerified: false };

      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(unverifiedUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(authService.login(loginDto)).rejects.toThrow(BadRequestException);
      expect(authRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });
  });

  describe('signup', () => {
    const signupDto: SignupDto = { 
      email: 'test@example.com', 
      password: 'password', 
      firstname: 'John', 
      lastname: 'Doe', 
      username: 'johndoe' 
    };
    const user: User = { 
      id: 'user-id', 
      email: signupDto.email, 
      username: signupDto.username, 
      isVerified: false 
    } as User;

    it('should create a new user and return it', async () => {
      jest.spyOn(authRepository, 'findUser').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      // Use the mocked return value directly
      (generateOtp as jest.Mock).mockReturnValue(123456); 
      jest.spyOn(authRepository, 'createUser').mockResolvedValue(user);

      const result = await authService.signup(signupDto);
      expect(result).toEqual(user);
      expect(authRepository.findUser).toHaveBeenCalledWith(signupDto.email, signupDto.username);
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(authRepository.createUser).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email or uername already exists', async () => {
      jest.spyOn(authRepository, 'findUser').mockResolvedValue(user);
      await expect(authService.signup(signupDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyAccount', () => {
    const verifyAccountDto: VerifyAccountDto = { 
      email: 'test@example.com', 
      otp: 123456 
    };
    let user: User = { 
      id: 'user-id', 
      email: verifyAccountDto.email, 
      verificationOtp: 123456, 
      otpExpiresIn: new Date(Date.now() + 10 * 60 * 1000), 
      isVerified: false
    } as User;

    it('should verify account and return tokens', async () => {
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(user);
      (otpExpired as jest.Mock).mockReturnValue(false); 
      jest.spyOn(authRepository, 'updateUserData').mockResolvedValue(user);
      jest.spyOn(jwt, 'sign').mockReturnValue('token' as never);

      const result = await authService.verifyAccount(verifyAccountDto);

      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
        user,
      });
      expect(authRepository.findByEmail).toHaveBeenCalledWith(verifyAccountDto.email);
      expect(authRepository.updateUserData).toHaveBeenCalled();
    });


    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(null);
      await expect(authService.verifyAccount(verifyAccountDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      user.verificationOtp = 654321;
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(user);
      await expect(authService.verifyAccount(verifyAccountDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired OTP', async () => {
      user.otpExpiresIn = new Date(Date.now() - 10 * 60 * 1000); // Set OTP to be expired (10 minutes in the past)
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(user);
      
      // Ensure the OTP is expired
      (otpExpired as jest.Mock).mockReturnValue(true); 
      
      await expect(authService.verifyAccount(verifyAccountDto)).rejects.toThrow(BadRequestException);
      await expect(authService.verifyAccount(verifyAccountDto)).rejects.toThrow('OTP Expired.');
    });
  });

  describe('forgotPassword', () => {
    it('should generate OTP and update user data', async () => {
      const forgotPasswordDto = { email: 'test@example.com' };

      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(user);
      (generateOtp as jest.Mock).mockReturnValue(123456); 
      jest.spyOn(authRepository, 'updateUserData').mockResolvedValue(user);

      const result = await authService.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(user);
      expect(authRepository.findByEmail).toHaveBeenCalledWith(forgotPasswordDto.email);
      expect(authRepository.updateUserData).toHaveBeenCalledWith(user.id, {
        passwordResetOtp: expect.any(Number), // OTP will be generated dynamically
        passwordResetOtpExpiresIn: expect.any(Date),
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const forgotPasswordDto = { email: 'nonexistent@example.com' };
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(null);

      await expect(authService.forgotPassword(forgotPasswordDto)).rejects.toThrow(NotFoundException);
      expect(authRepository.findByEmail).toHaveBeenCalledWith(forgotPasswordDto.email);
    });
  });

  describe('resetPassword', () => {
    
    const resetPasswordDto = { 
      email: 'test@example.com', 
      newPassword: 'newpassword', 
      otp: 123456 
    };
    beforeEach(() => {
      user.passwordResetOtp = resetPasswordDto.otp; // Set up OTP
      user.passwordResetOtpExpiresIn = new Date(Date.now() + 10 * 60 * 1000); // Valid OTP expiration
    });

    it('should reset the user password when OTP is valid', async () => {   

      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(user);
      (otpExpired as jest.Mock).mockReturnValue(false); 
      jest.spyOn(authRepository, 'updateUserData').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      const result = await authService.resetPassword(resetPasswordDto);
      expect(result).toEqual(user);
      expect(authRepository.findByEmail).toHaveBeenCalledWith(resetPasswordDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(resetPasswordDto.newPassword, 10);
      expect(authRepository.updateUserData).toHaveBeenCalledWith(user.id, {
          password: 'hashedpassword',
          passwordResetOtp: null,
          passwordResetOtpExpiresIn: null,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
        jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(null);
        await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid OTP', async () => {
        user.passwordResetOtp = 654321; // Set to an invalid OTP
        jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(user);
        await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired OTP', async () => {
        user.passwordResetOtpExpiresIn = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes in the past
        jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(user);
        (otpExpired as jest.Mock).mockReturnValue(true); // Ensure OTP is expired
        await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });

  });
});
