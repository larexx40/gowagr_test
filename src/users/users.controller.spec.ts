import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/user.dto';
import { HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithAuth } from 'src/auth/types/auth.type';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const userId = 'user-id';
  const user = { 
    id: userId, 
    username: 'testUser', 
    email: 'test@example.com' 
  } as any;
  const req: RequestWithAuth = { user: { userId } } as RequestWithAuth;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getProfile: jest.fn(),
            getUserByUsername: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('should return the profile of the authenticated user', async () => {
      jest.spyOn(usersService, 'getProfile').mockResolvedValue(user);

      const result = await usersController.getProfile(req);

      expect(result).toEqual({
        status: true,
        message: "Profile fetched successfully",
        data: user,
      });
      expect(usersService.getProfile).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserByUsername', () => {
    it('should return the user by username', async () => {
      const username = 'testUser';
      jest.spyOn(usersService, 'getUserByUsername').mockResolvedValue(user);

      const result = await usersController.getUserByUsername(username);

      expect(result).toEqual({
        status: true,
        message: "User fetched successfully",
        data: user,
      });
      expect(usersService.getUserByUsername).toHaveBeenCalledWith(username);
    });

  });

  describe('updateProfile', () => {
    it('should update and return the user profile', async () => {
      // Ensure userId is defined
      const userId = 'user-id'; // Use the expected user ID here
      const updateProfileDto: UpdateProfileDto = { 
        username: 'newUsername',
        firstname: 'johnny',
        lastname: 'larry'
      };
      
      const updatedUser = { 
        ...user, 
        ...updateProfileDto 
      };
  
      console.log("new user data", updatedUser);
      
      // Mocking the request object
      const req: RequestWithAuth = {
        user: { userId: userId } // Ensure this is correctly set
      } as RequestWithAuth;
  
      console.log("Req id", req.user.userId); // This should log "user-id"
      
      // Mock the updateProfile method
      jest.spyOn(usersService, 'updateProfile').mockResolvedValue(updatedUser);
  
      // Call the controller method
      const result = await usersController.updateProfile(req, updateProfileDto);
  
      // Check the response
      expect(result).toEqual({
        status: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
  
      // Ensure the service method was called with the correct arguments
      expect(usersService.updateProfile).toHaveBeenCalledWith(userId, updateProfileDto);
    });
  });
  
  
  
});
