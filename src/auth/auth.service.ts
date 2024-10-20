import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { LoginDto, SignupDto, VerifyAccountDto, ResetPasswordDto, RegenerateTokenDto, ForgotPassword, SendOtpDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { generateOtp, otpExpired } from 'utils/helpers';
import { AuthTokenPayload } from 'src/types/auth.type';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) { }

  /**
   * Authenticates a user and generates access and refresh tokens.
   * 
   * @param {LoginDto} loginDto - The login credentials.
   * @returns {Promise<{ accessToken: string; refreshToken: string; user: User }>} - A promise containing tokens and user data.
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { email, password } = loginDto;
    const user = await this.authRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    //payload to be encoded in jwt token
    const authPayload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    // Generate access token (valid for 1 day)
    const accessToken = jwt.sign(authPayload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    // Generate refresh token (valid for 30 days)
    const refreshToken = jwt.sign(authPayload, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '30d' });

    return { accessToken, refreshToken, user };
  }

  /**
   * Registers a new user and sends a verification OTP.
   * 
   * @param {SignupDto} signupDto - The user signup information.
   * @returns {Promise<User>} - A promise with the created user data.
   */
  async signup(signupDto: SignupDto): Promise<User> {
    const { email, password, firstname, lastname, username } = signupDto;

    // Validate email and username
    const userExist = await this.authRepository.findUser(email, username);
    if (userExist && userExist.email === email) throw new BadRequestException("Account with email already exists");
    if (userExist && userExist.username === username) throw new BadRequestException("Account with username already exists");

    // Encrypt user password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification OTP and expiry time
    const verificationOtp = generateOtp();
    const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000);

    // Save user data to db
    const user = await this.authRepository.createUser({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      username,
      verificationOtp,
      otpExpiresIn,
    });

    // Clear OTP fields before returning
    user.otpExpiresIn = null;

    // TODO: Implement mail service, send OTP to user email

    return user;
  }

  /**
   * Verifies a user's account with the provided six digit OTP.
   * 
   * @param {VerifyAccountDto} verifyAccountDto - The verification information.
   * @returns {Promise<{ accessToken: string; refreshToken: string; user: User }>} - A promise containing tokens and user data.
    * @throws {NotFoundException} - Throws an error if the user is not found.
    * @throws {BadRequestException} - Throws an error if otp is invalid or expired.
   */
  async verifyAccount(verifyAccountDto: VerifyAccountDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { email, otp } = verifyAccountDto;

    // Find user with email
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new NotFoundException("Account with email not found");
    //return error if usr is already verified;
    if (user.isVerified) throw new BadRequestException("Account already verified");

    // Validate the OTP and expire time
    if (user.verificationOtp !== otp) throw new BadRequestException("Invalid OTP");
    if (otpExpired(user.otpExpiresIn)) throw new BadRequestException("OTP Expired.");

    const updatedUser = await this.authRepository.updateUserData(user.id, {
      isVerified: true,
      otpExpiresIn: null,
      verificationOtp: null,
    });

    //payload to be encoded in jwt token
    const authPayload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    // Generate access token (valid for 1 day)
    const accessToken = jwt.sign(authPayload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    // Generate refresh token (valid for 30 days)
    const refreshToken = jwt.sign(authPayload, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '30d' });

    return {
      user: updatedUser,
      accessToken,
      refreshToken,
    };
  }

  /**
 * Resend verification OTP to the user via email.
 * 
 * @param {SendOtpDto} resendOtpDto - Data Transfer Object containing the user's email.
 * @returns {Promise<User>} - The updated user entity with a new OTP.
 * @throws {NotFoundException} - Throws an error if the user is not found.
 */
  async resendVerificationOtp(resendOtpDto: SendOtpDto): Promise<User> {
    const { email } = resendOtpDto;

    // Validate email and username
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new NotFoundException("User not found");

    // Generate verification OTP and expiry time
    const verificationOtp = generateOtp();
    const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000);

    // Save otp and expiry to db
    const newuser = await this.authRepository.updateUserData(user.id, {
      verificationOtp,
      otpExpiresIn,
    });

    // Clear OTP field before returning
    user.otpExpiresIn = null;

    // TODO: Implement mail service, send OTP to user email

    return newuser;
  }

  /**
 * Generates a password reset OTP and sends it to the user's email.
 * 
 * @param {ForgotPassword} forgotPasswordDto - Contains the user's email for password reset.
 * @returns {Promise<User>} - A promise with the status, message, and OTP data.
 * @throws {NotFoundException} If the user with the provided email does not exist.
 * 
 */
  async forgotPassword(forgotPasswordDto: ForgotPassword): Promise<User> {
    const { email } = forgotPasswordDto;
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new NotFoundException("Account with email not found");

    const resetOtp = generateOtp();
    const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await this.authRepository.updateUserData(user.id, {
      passwordResetOtp: resetOtp,
      passwordResetOtpExpiresIn: otpExpiresIn,
    });

    newUser.passwordResetOtpExpiresIn = null;

    // TODO: send reset token via mail
    return newUser;
  }

  /**
 * Resend reset password OTP to the user via email.
 * 
 * @param {SendOtpDto} resendOtpDto - Data Transfer Object containing the user's email.
 * @returns {Promise<User>} - The updated user entity with a new OTP.
 * @throws {NotFoundException} - Throws an error if the user is not found.
 */
  async resendResetPasswordOtp(resendOtpDto: SendOtpDto): Promise<User> {
    const { email } = resendOtpDto;

    // Validate email and username
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new NotFoundException("User not found");

    // Generate verification OTP and expiry time
    const verificationOtp = generateOtp();
    const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000);

    // Save otp and expiry to db
    const newuser = await this.authRepository.updateUserData(user.id, {
      passwordResetOtp: verificationOtp,
      passwordResetOtpExpiresIn: otpExpiresIn
    });

    // Clear OTP field before returning
    user.passwordResetOtpExpiresIn = null;

    // TODO: Implement mail service, send OTP to user email

    return newuser;
  }

  /**
   * Resets a user's password after OTP verification.
   * 
   * @param {ResetPasswordDto} resetPasswordDto - The reset password information.
   * @returns {Promise<User>} - A promise with an empty object or relevant response.
 * @throws {NotFoundException} - Throws an error if the user is not found.
 * @throws {BadRequestException} - Throws an error if OTP is invalid or expired.
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
    const { newPassword, email, otp } = resetPasswordDto;

    // Find user with email
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new NotFoundException("Account with email not found");

    // Validate the OTP and expire time
    if (user.passwordResetOtp !== otp) throw new BadRequestException("Invalid OTP");
    if (otpExpired(user.passwordResetOtpExpiresIn)) throw new BadRequestException("OTP Expired.");

    // Encrypt new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await this.authRepository.updateUserData(user.id, {
      password: hashedPassword,
      passwordResetOtp: null,
      passwordResetOtpExpiresIn: null,
    });

    return updatedUser;
  }

  /**
   * Regenerates an access token using a refresh token.
   * 
   * @param {RegenerateTokenDto} regenerateTokenDto - The refresh token information.
   * @returns {Promise<{ accessToken: string; refreshToken: string }>} - A promise containing the new tokens.
   */
  async regenerateToken(regenerateTokenDto: RegenerateTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = regenerateTokenDto;

    const payload: AuthTokenPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY) as AuthTokenPayload;

    const authPayload: AuthTokenPayload = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    };

    // Generate new access token
    const accessToken = jwt.sign(authPayload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
    return { accessToken, refreshToken }; // Return the new access token and the old refresh token
  }
}
