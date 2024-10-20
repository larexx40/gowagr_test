import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProfileDto } from './dto/user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestWithAuth } from 'src/types/auth.type';

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
  @Get('profile')
  getProfile(
    @Req() req: RequestWithAuth
  ) {
    const userId = req.user.userId;
    return this.usersService.getProfile(userId);
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
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
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
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

}
