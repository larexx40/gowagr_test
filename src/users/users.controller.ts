import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProfileDto } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get the authenticated user's profile
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    const userId = req.user.id;
    return this.usersService.getProfile(userId);
  }

    // Get user by username
    @Get('username/:username')
    getUserByUsername(@Param('username') username: string) {
      return this.usersService.getUserByUsername(username);
    }
  
    // Update the authenticated user's profile
    @UseGuards(AuthGuard)
    @Patch('profile')
    updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
      const userId = req.user.id;
      return this.usersService.updateProfile(userId, updateProfileDto);
    }
}
