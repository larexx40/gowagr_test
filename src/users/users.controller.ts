import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProfileDto } from './dto/user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestWithAuth } from 'src/auth/types/auth.type';

/**
 * UsersController handles all user-related operations.
 * It provides endpoints for fetching user profiles, updating profiles, 
 * and retrieving users by their usernames.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
  * Retrieves the profile of the authenticated user.
  * 
  * @param req - The request object containing the user's authentication details from decoded JWT.
  * @returns The profile data of the authenticated user.
  * @throws UnauthorizedException if the user is not authenticated.
  * @throws NotFoundException if the user profile is not found.
  */

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Fetch user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile fetched successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing, invalid or expired OTP.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getProfile(
    @Req() req: RequestWithAuth
  ) {
    const userId = req.user.userId;
    const user = await this.usersService.getProfile(userId);
    return {
      status: true,
      message:"Profile fetched successfully",
      data: user
    }
  }

  /**
   * Retrieves a user by their username.
   * 
   * @param username - The username of the user to retrieve.
   * @returns The user data associated with the provided username.
   * @throws NotFoundException if no user is found with the given username.
   */
  @Get('username/:username')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Find user by username' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User fetched successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing, invalid or expired OTP.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not with username not found' })
  async getUserByUsername(
    @Param('username') username: string
  ) {
    const user = await this.usersService.getUserByUsername(username);
    return {
      status: true,
      message:"User fetched successfully",
      data: user
    }
  }

  /**
    * Updates the profile of the authenticated user.
    * 
    * @param req - The request object containing the user's authentication details.
    * @param updateProfileDto - The data transfer object containing the updated profile information.
    * @returns The updated user profile data.
    * @throws UnauthorizedException if the user is not authenticated.
    * @throws BadRequestException if the provided data is invalid.
    */
  @UseGuards(AuthGuard)
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile updated successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing, invalid or expired OTP.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User with username already exist' })
  async updateProfile(
    @Req() req: RequestWithAuth, 
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const userId = req.user.userId;
    const newUser = await this.usersService.updateProfile(userId, updateProfileDto);
    return {
      status: true,
      message:"Profile updated successfully",
      data: newUser
    }
  }

}
