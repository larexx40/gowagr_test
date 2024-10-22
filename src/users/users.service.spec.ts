import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let cacheManager: Cache;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUser = {
    id: 'user-id',
    username: 'john_doe',
    email: 'john@example.com',
  } as User;
  
  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return the user profile if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.getProfile(mockUser.id);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.getProfile(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserByUsername', () => {
    it('should return the user by username if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.getUserByUsername('john_doe');
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { username: 'john_doe' } });
    });

    it('should throw NotFoundException if user not found by username', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.getUserByUsername('john_doe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserBalance', () => {
    it('should return balance from cache if available', async () => {
      const userId = 'userid';
      const cachedBalance = 1000.60;
  
      // Mock cache to return a cached value
      mockCacheManager.get.mockResolvedValue(cachedBalance);
  
      const result = await service.getUserBalance(userId);
  
      expect(result).toEqual(cachedBalance);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`user_balance_${userId}`);
      expect(mockUserRepository.findOne).not.toHaveBeenCalled(); // Ensure DB is not called
    });
  
    it('should return balance from database and cache it if not cached', async () => {
      const userId = 'userid';
      const user = { id: userId, balance: 200 } as User;
  
      // Mock cache to return null (no cached value)
      mockCacheManager.get.mockResolvedValue(null); 
      // Mock user repository to return the user
      mockUserRepository.findOne.mockResolvedValue(user);
  
      const result = await service.getUserBalance(userId);
  
      expect(result).toEqual(user.balance);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockCacheManager.set).toHaveBeenCalledWith(`user_balance_${userId}`, user.balance, 600000);
    });
  
    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'userid';
  
      // Mock cache to return null
      mockCacheManager.get.mockResolvedValue(null); 
      // Mock user repository to return null (no user found)
      mockUserRepository.findOne.mockResolvedValue(null); 
  
      await expect(service.getUserBalance(userId)).rejects.toThrow(NotFoundException);
    });
  });
  

  describe('updateProfile', () => {
    const updateProfileDto: UpdateProfileDto = {
      username: 'new_username',
      firstname: 'new_email@example.com',
    };

    it('should update the user profile if found and username is unique', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser); // for finding the current user
      mockUserRepository.findOne.mockResolvedValueOnce(null); // for checking if new username exists

      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateProfileDto,
      });

      const result = await service.updateProfile(mockUser.id, updateProfileDto);
      expect(result).toEqual({ ...mockUser, ...updateProfileDto });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found during update', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.updateProfile(mockUser.id, updateProfileDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if the new username is already taken by another user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser); // for finding the current user
      mockUserRepository.findOne.mockResolvedValueOnce({
        id: 'another-user',
        username: mockUser.username,
      }); // for checking if new username exists

      await expect(service.updateProfile(mockUser.id, updateProfileDto)).rejects.toThrow(ConflictException);
    });

    it('should allow updating profile when no username is provided', async () => {
      const updateProfileDtoNoUsername: UpdateProfileDto = {
        firstname: 'John',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser); // find user
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateProfileDtoNoUsername,
      });

      const result = await service.updateProfile(mockUser.id, updateProfileDtoNoUsername);
      expect(result).toEqual({ ...mockUser, ...updateProfileDtoNoUsername });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});
