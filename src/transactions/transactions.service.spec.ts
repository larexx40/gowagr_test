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

  describe('deposit', () => {
    it('should perform deposit successfully and cache balance', async () => {
      // Mock user found
      mockEntityManager.getOne.mockResolvedValue(mockUser);
      mockEntityManager.save.mockResolvedValue(mockUser);
      mockTransactionRepository.manager.transaction.mockImplementation(async (cb) => cb(entityManager));

      const result = await transactionService.deposit('user1', mockDepositDto);

      expect(result).toBeDefined();
      expect(mockEntityManager.getOne).toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalledTimes(2); // for user and transaction
      expect(mockCacheManager.set).toHaveBeenCalledWith(`user_balance_user1`, 150, 600000);
    });

    it('should throw BadRequestException if operation cannot be performed at that moment', async () => {
      // Mock user not found
      mockEntityManager.getOne.mockResolvedValue(null);

      await expect(transactionService.deposit('user1', mockDepositDto)).rejects.toThrow(BadRequestException);
    });
  });

  

  describe('getAllUserTransactions', () => {
    it('should return all user transactions with pagination', async () => {
      const transactions = [{ id: '1' }, { id: '2' }] as Transaction[];
      transactionRepository.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        getMany: jest.fn().mockResolvedValue(transactions),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      });

      const result = await transactionService.getAllUserTransactions('userid', 1, 2, null, null, null, null);
      expect(result.data).toEqual(transactions);
      expect(result.totalCount).toEqual(2);
    });

    it('should throw NotFoundException if no transactions are found', async () => {
      transactionRepository.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      });

      await expect(
        transactionService.getAllUserTransactions('userid', 1, 10, null, null, null, null),
      ).rejects.toThrow(NotFoundException);
    });
  });


});
