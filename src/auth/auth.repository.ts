import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUser(email: string, username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [
        { email },
        { username }
      ]
    });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUserData(userId: string, userData: Partial<User>): Promise<User> {
    const user = await this.userRepository.preload({
      id: userId,
      ...userData,
    });

    // Save the updated user data
    return await this.userRepository.save(user);
  }
}
