import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { LoginDto, SignupDto, VerifyAccountDto, ResetPasswordDto, VerifyResetOtpDto, RegenerateTokenDto, ForgotPassword } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { generateOtp, otpExpired, } from 'utils/helpers';
import { Request } from 'express';
import { AuthTokenPayload } from 'src/types/auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.authRepository.findByEmail(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const authPayload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    // Generate access token (valid for 1 day)
    const accessToken = jwt.sign(authPayload, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    // Generate refresh token (valid for 30 days)
    const refreshToken = jwt.sign(authPayload, process.env.JWT_REFRESH_SECRET_KEY, {
      expiresIn: '30d',
    });

    return {
      status: true,
      message: 'User logged in successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    };
  }

  async signup(signupDto: SignupDto) {
    const { email, password, firstname, lastname, username } = signupDto;

    //encrypt user password with bcrypt;
    const hashedPassword = await bcrypt.hash(password, 10);

    //generate verification otp and expiry time
    const verificationOtp = generateOtp()
    const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000);

    //save user data to db
    const user = await this.authRepository.createUser({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      username,
      verificationOtp,
      otpExpiresIn
    });

    user.otpExpiresIn = null;
    user.verificationOtp = null


    //TODO: implement mail service, send otp to user mail
    
    return {
      status: true,
      message: 'User created successfully, an otp has been sent to your email',
      data: {
        user,
      },
    };
  }

  async verifyAccount(verifyAccountDto: VerifyAccountDto) {
    const { email, otp } = verifyAccountDto;

    //find user with email
    const user = await this.authRepository.findByEmail(email)
    if(!user) throw  new NotFoundException("Account with email not found");

    //validate the otp and expire time
    if(user.verificationOtp !== otp) throw new BadRequestException("Invalid OTP");
    if(otpExpired(user.otpExpiresIn)) throw new BadRequestException("OTP Expired.")

    const updatedUser = await this.authRepository.updateUserData(user.id, {
      isVerified: true,
      otpExpiresIn: null,
      verificationOtp: null,
    })

    const authPayload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    // Generate access token (valid for 1 day)
    const accessToken = jwt.sign(authPayload, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    // Generate refresh token (valid for 30 days)
    const refreshToken = jwt.sign(authPayload, process.env.JWT_REFRESH_SECRET_KEY, {
      expiresIn: '30d',
    });

    return {
      status: true,
      message: 'Otp verification successful',
      data: {
        user: updatedUser,
        accessToken,
        refreshToken,
      },
    };

    


  }

  async forgotPassword(
    forgotPasswordDto: ForgotPassword,
    request: Request
  ) {
    const {email} = forgotPasswordDto
    //find user with email
    const user = await this.authRepository.findByEmail(email)
    if(!user) throw  new NotFoundException("Account with email not found");

    //generate password reset otp and expiry time
    const resetOtp = generateOtp()
    const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000);

    const updateUser = await this.authRepository.updateUserData(user.id, {
      passwordResetOtp: resetOtp,
      passwordResetOtpExpiresIn: otpExpiresIn
    })

    //TODO: send token and verificationUrl to user mail

    user.passwordResetOtp = null;
    user.passwordResetOtpExpiresIn = null;

    return {
      status: true,
      message: 'Reset token has been sent to your email',
      data:{
        resetOtp
      }
    };



  }


  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const {newPassword, email, otp} = resetPasswordDto
    //find user with email
    const user = await this.authRepository.findByEmail(email)
    if(!user) throw  new NotFoundException("Account with email not found");

    //validate the otp and expire time
    if(user.passwordResetOtp !== otp) throw new BadRequestException("Invalid OTP");
    if(otpExpired(user.passwordResetOtpExpiresIn)) throw new BadRequestException("OTP Expired.")

    //encrypt new password with bcrypt;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await this.authRepository.updateUserData(user.id, {
      password: hashedPassword,
      passwordResetOtp: null,
      passwordResetOtpExpiresIn: null,
    })

    return {
      status: true,
      message: 'Password Reset Successful',
      data: {
        
      },
    };

    
  }

  async regenerateToken(regenerateTokenDto: RegenerateTokenDto) {
    const { refreshToken } = regenerateTokenDto;
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY) as AuthTokenPayload;
      //find user with email
      const user = await this.authRepository.findByEmail(payload.email)
      if(!user) throw  new BadRequestException("Invalid refresh token");
      
      const authPayload: AuthTokenPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };

      // Generate access token (valid for 1 day)
      const accessToken = jwt.sign(authPayload, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d',
      });

      return {
        status: true,
        message: 'Access token generated successfully',
        data:{
          accessToken
        }
      };
  
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }
}
