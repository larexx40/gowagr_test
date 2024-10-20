import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/user.dto';

/**
 * UsersService handles all user-related operations such as 
 * fetching user profiles, updating profiles, and retrieving 
 * users by their usernames.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Fetches the authenticated user's profile by their ID.
   * 
   * @param userId - The ID of the user whose profile is to be fetched.
   * @returns A promise that resolves to the User object if found.
   * @throws {NotFoundException} if the user with the given ID is not found.
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Fetches a user by their username.
   * 
   * @param username - The username of the user to be fetched.
   * @returns A promise that resolves to the User object if found.
   * @throws {NotFoundException} if the user with the given username is not found.
   */
  async getUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Updates the authenticated user's profile with new data.
   * 
   * @param userId - The ID of the user whose profile is to be updated.
   * @param updateProfileDto - An object containing the new profile data.
   * @returns A promise that resolves to the updated User object.
   * @throws {NotFoundException} if the user with the given ID is not found.
  * @throws {BadRequestException} - if username already exist.
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if username exists and is different from the current user's username
    if (updateProfileDto.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateProfileDto.username },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Username already exists');
      }
    }

    Object.assign(user, updateProfileDto);
    return this.userRepository.save(user);
  }
}
