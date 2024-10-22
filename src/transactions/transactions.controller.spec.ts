import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { DepositDto, TransferDto } from './dto/transaction.dto';
import { RequestWithAuth } from 'src/auth/types/auth.type';
import { Transaction } from './entities/transaction.entity';
import { HttpStatus } from '@nestjs/common';

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;

  const mockTransactionService = {
    deposit: jest.fn(),
    transfer: jest.fn(),
    getAllUserTransactions: jest.fn(),
    getAllUserTransfers: jest.fn(),
  };

  const mockRequestWithAuth = (userId: string): RequestWithAuth => ({
    user: { userId },
  } as RequestWithAuth);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    transactionController = module.get<TransactionController>(TransactionController);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  describe('deposit', () => {
    it('should deposit an amount and return the transaction', async () => {
      const userId = 'testUserId';
      const depositDto: DepositDto = { amount: 100 };
      const transaction: Transaction = { id: '1', amount: 100, type: 'DEPOSIT' } as Transaction;

      jest.spyOn(transactionService, 'deposit').mockResolvedValue(transaction);
      
      const req = mockRequestWithAuth(userId);
      const result = await transactionController.deposit(req, depositDto);

      expect(result).toEqual({
        status: true,
        message: "Deposit transaction created successfully",
        data: transaction,
      });
      expect(transactionService.deposit).toHaveBeenCalledWith(userId, depositDto);
    });
  });

  describe('transfer', () => {
    it('should transfer funds and return the transaction', async () => {
      const userId = 'testUserId';
      const transferDto: TransferDto = { recipientUsername: 'recipientUser', amount: 50 };
      const transaction: Transaction = { id: '2', amount: 50, type: 'TRANSFER' } as Transaction;

      jest.spyOn(transactionService, 'transfer').mockResolvedValue(transaction);
      
      const req = mockRequestWithAuth(userId);
      const result = await transactionController.transfer(req, transferDto);

      expect(result).toEqual({
        status: true,
        message: "Money sent successfully",
        data: transaction,
      });
      expect(transactionService.transfer).toHaveBeenCalledWith(userId, transferDto);
    });
  });

  describe('getAllUserTransactions', () => {
    it('should retrieve all user transactions', async () => {
      const userId = 'testUserId';
      const transactions: Transaction[] = [{ id: '1', amount: 100, type: 'DEPOSIT' } as Transaction];
      const paginationResult = { data: transactions, totalCount: 1, page: 1, perPage: 10 };

      jest.spyOn(transactionService, 'getAllUserTransactions').mockResolvedValue(paginationResult);

      const req = mockRequestWithAuth(userId);
      const result = await transactionController.getAllUserTransactions(req);

      expect(result).toEqual({
        status: true,
        message: "List of transactions retrieved successfully",
        data: transactions,
        totalCount: 1,
        page: 1,
        perPage: 10,
      });
      expect(transactionService.getAllUserTransactions).toHaveBeenCalledWith(userId, 1, 10, undefined, undefined, undefined, undefined);
    });
  });

  describe('getAllUserTransfers', () => {
    it('should retrieve all user transfers', async () => {
      const userId = 'testUserId';
      const transfers: Transaction[] = [{ id: '2', amount: 50, type: 'TRANSFER' } as Transaction];
      const paginationResult = { data: transfers, totalCount: 1, page: 1, perPage: 10 };

      jest.spyOn(transactionService, 'getAllUserTransfers').mockResolvedValue(paginationResult);

      const req = mockRequestWithAuth(userId);
      const result = await transactionController.getAllUserTransfers(req);

      expect(result).toEqual({
        status: true,
        message: "List of transactions retrieved successfully",
        data: transfers,
        totalCount: 1,
        page: 1,
        perPage: 10,
      });
      expect(transactionService.getAllUserTransfers).toHaveBeenCalledWith(userId, 1, 10, undefined, undefined, undefined);
    });
  });
});
