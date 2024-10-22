import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transactions.service';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Transaction } from './entities/transaction.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { TransactionType, TransactionStatus } from 'src/utils/enum';
import { TransferDto } from './dto/transaction.dto';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let userRepository: Repository<User>;
  let transactionRepository: Repository<Transaction>;
  let cacheManager: Cache;
  let entityManager: EntityManager;

  const mockUser = {
    id: 'user1',
    balance: 100
  };
  const mockDepositDto = { amount: 50 };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionRepository = {
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockEntityManager = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    entityManager = module.get<EntityManager>(EntityManager);

    // Clear cache mocks
    jest.clearAllMocks()

  });

  describe('transfer', () => {
    const mockUser = {
      id: 'new-sender',
      balance: 400
    };
    const recipient = {
      id: 'new-receiver',
      balance: 200,
      username: 'recipient-username'
    } as User;
  
    it('should perform transfer successfully and cache balances', async () => {
      const transferDto: TransferDto = { 
        recipientUsername: recipient.username, 
        amount: 100 
      };
  
      // Mock sender and recipient found
      mockUserRepository.findOne = jest.fn().mockImplementation((criteria) => {
        if (criteria.where.id === mockUser.id) return mockUser;
        if (criteria.where.username === recipient.username) return recipient;
        return null; // default case to handle no match
      });
  
      // Mock getOne and save functions for locking users within the transaction
      // First call returns sender (lockedSender), second call returns recipient (lockedRecipient)
      mockEntityManager.getOne.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(recipient);
      
      // Mock save to simulate updated balances after the transfer
      mockEntityManager.save.mockImplementationOnce((user) => {
        if (user.id === mockUser.id) {
          user.balance = mockUser.balance - transferDto.amount; // Update sender balance
          return user;
        }
        if (user.id === recipient.id) {
          user.balance = recipient.balance + transferDto.amount; // Update recipient balance
          return user;
        }
      });
  
      // Mock transaction
      mockTransactionRepository.manager.transaction.mockImplementation(async (cb) => cb(entityManager));
  
      // Perform the transfer
      const result = await transactionService.transfer(mockUser.id, transferDto);
  
  
      // Check that the transaction was called
      expect(transactionRepository.manager.transaction).toHaveBeenCalled();
  
      // Check the number of calls to cacheManager.set
      expect(cacheManager.set).toHaveBeenCalledTimes(2); // once for the sender, once for the recipient
  
      // Verify that the balance was correctly set in the cache for the sender and recipient
      expect(cacheManager.set).toHaveBeenCalledWith(`user_balance_${mockUser.id}`, mockUser.balance, 600000); // Sender's balance (300)
      expect(cacheManager.set).toHaveBeenCalledWith(`user_balance_${recipient.id}`, recipient.balance, 600000); // Recipient's balance (300)
  
      expect(result).toBeDefined();
    });
  
    it('should throw NotFoundException if sender or recipient is not found', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null); // No sender found
  
      const transferDto: TransferDto = { recipientUsername: 'recipient', amount: 100 };
      await expect(transactionService.transfer(mockUser.id, transferDto)).rejects.toThrow(NotFoundException);
    });
  
    it('should throw BadRequestException if sender has insufficient balance', async () => {
      const transferDto: TransferDto = {
        recipientUsername: recipient.username,
        amount: 10000
      };
  
      userRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser) // Sender found
        .mockResolvedValueOnce(recipient); // Recipient found
  
      await expect(transactionService.transfer(mockUser.id, transferDto)).rejects.toThrow(BadRequestException);
    });
  });
  

  // describe('getUserBalance', () => {
  //   it('should return balance from cache if available', async () => {
  //     cacheManager.get = jest.fn().mockResolvedValue(100); // Cached value

  //     const result = await transactionService.getUserBalance('userid');

  //     expect(result).toEqual(100);
  //     expect(cacheManager.get).toHaveBeenCalledWith('user_balance_userid');
  //   });

  //   it('should return balance from database and cache it if not cached', async () => {
  //     cacheManager.get = jest.fn().mockResolvedValue(null); // No cached value
  //     const user = { id: 'userid', balance: 200 } as User;
  //     userRepository.findOne = jest.fn().mockResolvedValue(user);

  //     const result = await transactionService.getUserBalance('userid');

  //     expect(result).toEqual(200);
  //     expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'userid' } });
  //     expect(cacheManager.set).toHaveBeenCalledWith('user_balance_userid', 200, 600000);
  //   });

  //   it('should throw NotFoundException if user is not found', async () => {
  //     userRepository.findOne = jest.fn().mockResolvedValue(null); // No user found

  //     await expect(transactionService.getUserBalance('userid')).rejects.toThrow(NotFoundException);
  //   });
  // });

  // describe('deposit', () => {
  //   it('should perform deposit successfully and cache balance', async () => {
  //     // Mock user found
  //     mockEntityManager.getOne.mockResolvedValue(mockUser);
  //     mockEntityManager.save.mockResolvedValue(mockUser);
  //     mockTransactionRepository.manager.transaction.mockImplementation(async (cb) => cb(entityManager));

  //     const result = await transactionService.deposit('user1', mockDepositDto);

  //     expect(result).toBeDefined();
  //     expect(mockEntityManager.getOne).toHaveBeenCalled();
  //     expect(mockEntityManager.save).toHaveBeenCalledTimes(2); // for user and transaction
  //     expect(mockCacheManager.set).toHaveBeenCalledWith(`user_balance_user1`, 150, 600000);
  //   });

  //   it('should throw BadRequestException if operation cannot be performed at that moment', async () => {
  //     // Mock user not found
  //     mockEntityManager.getOne.mockResolvedValue(null);

  //     await expect(transactionService.deposit('user1', mockDepositDto)).rejects.toThrow(BadRequestException);
  //   });
  // });

  

  // describe('getAllUserTransactions', () => {
  //   it('should return all user transactions with pagination', async () => {
  //     const transactions = [{ id: '1' }, { id: '2' }] as Transaction[];
  //     transactionRepository.createQueryBuilder = jest.fn().mockReturnValue({
  //       where: jest.fn().mockReturnThis(),
  //       andWhere: jest.fn().mockReturnThis(),
  //       getCount: jest.fn().mockResolvedValue(2),
  //       getMany: jest.fn().mockResolvedValue(transactions),
  //       skip: jest.fn().mockReturnThis(),
  //       take: jest.fn().mockReturnThis(),
  //       orderBy: jest.fn().mockReturnThis(),
  //     });

  //     const result = await transactionService.getAllUserTransactions('userid', 1, 2, null, null, null, null);
  //     expect(result.data).toEqual(transactions);
  //     expect(result.totalCount).toEqual(2);
  //   });

  //   it('should throw NotFoundException if no transactions are found', async () => {
  //     transactionRepository.createQueryBuilder = jest.fn().mockReturnValue({
  //       where: jest.fn().mockReturnThis(),
  //       andWhere: jest.fn().mockReturnThis(),
  //       getCount: jest.fn().mockResolvedValue(0),
  //       getMany: jest.fn().mockResolvedValue([]),
  //       skip: jest.fn().mockReturnThis(),
  //       take: jest.fn().mockReturnThis(),
  //       orderBy: jest.fn().mockReturnThis(),
  //     });

  //     await expect(
  //       transactionService.getAllUserTransactions('userid', 1, 10, null, null, null, null),
  //     ).rejects.toThrow(NotFoundException);
  //   });
  // });


});
