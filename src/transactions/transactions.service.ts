import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, EntityManager } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus, TransactionType } from 'utils/enum';
import { DepositDto, TransferDto } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) { }

  /**
   * Deposit an amount to a user's account and record a transaction
   * @param userId - ID of the user making the deposit
   * @param amount - Amount to be deposited
   */
  async deposit(userId: string, depositDto: DepositDto): Promise<Transaction> {
    const { amount } = depositDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Start a transaction block 
    //this will automatically rollback the entire transaction if any error occur.
    return await this.transactionRepository.manager.transaction(async (entityManager: EntityManager) => {
      // Lock the user row to prevent race conditions
      const lockedUser = await entityManager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: userId })
        .getOne();

      if (!lockedUser) {
        throw new BadRequestException('Cannot perform operation at the moment.');
      }

      // Update the user's balance
      lockedUser.balance += amount;

      // Save updated user balance and create a deposit transaction record for the user
      await entityManager.save(lockedUser);

      // Record the deposit transaction
      const transaction = new Transaction();
      transaction.initiatiorId = lockedUser.id;
      transaction.initiatior = lockedUser;
      transaction.amount = amount;
      transaction.type = TransactionType.DEPOSIT;
      transaction.status = TransactionStatus.SUCCESS

      // Save the transaction
      return await entityManager.save(transaction);
    });
  }

  /**
   * Transfers funds between two users using their usernames.
   * @param {TransferDto} transferDto - The transfer data.
   * @returns {Promise<Transaction>} - The created transfer transaction.
   */
  async transfer(userId: string, transferDto: TransferDto): Promise<Transaction> {
    const { recipientUsername, amount } = transferDto;

    const sender = await this.userRepository.findOne({ where: { id: userId } });
    const recipient = await this.userRepository.findOne({ where: { username: recipientUsername } });

    if (!sender) throw new NotFoundException('Sender not found');
    if (!recipient) throw new NotFoundException('Recipient not found');


    // Start a transaction block 
    //this will automatically rollback the entire transaction if any error occur.
    const res = await this.transactionRepository.manager.transaction(async (entityManager) => {
      // Lock the sender and recipient rows for the transaction to avoid race conditions
      const lockedSender = await entityManager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: sender.id })
        .getOne();

      const lockedRecipient = await entityManager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: recipient.id })
        .getOne();

      if (lockedSender.balance < amount) throw new BadRequestException('Insufficient balance');

      // Deduct amount from sender
      lockedSender.balance -= amount;
      await entityManager.save(lockedSender);

      // Add amount to recipient
      lockedRecipient.balance += amount;
      await entityManager.save(lockedRecipient);

      // Record the transaction
      const transaction = new Transaction();
      transaction.initiatiorId = sender.id;
      transaction.initiatior = sender;
      transaction.recipientId = recipient.id;
      transaction.recipient = recipient;
      transaction.amount = amount;
      transaction.type = TransactionType.TRANSFER;
      transaction.status = TransactionStatus.SUCCESS

      return await entityManager.save(transaction);
    });

    return res
  }

  /**
 * Retrieves all transactions of a specific user with pagination, filtering by transaction type, status, and date range.
 * 
 * @param {string} userId - The user ID (can be initiator or recipient of the transaction).
 * @param {number} [page=1] - The page number for pagination.
 * @param {number} [limit=10] - The number of transactions per page.
 * @param {TransactionType} [transactionType] - The type of transaction to filter by (e.g., DEPOSIT, TRANSFER).
 * @param {TransactionStatus} [transactionStatus] - The status of the transaction to filter by (e.g., SUCCESS, FAILED).
 * @param {Date} [startDate] - The start date to filter transactions by creation date.
 * @param {Date} [endDate] - The end date to filter transactions by creation date.
 * @returns {Promise<{ data: Transaction[], totalCount: number, page: number, perPage: number }>} - The list of transactions, total count, and pagination information.
 * @throws {NotFoundException} - Throws if no transactions are found for the user.
 */
  async getAllUserTransactions(
    userId: string,
    page = 1,
    limit = 10,
    transactionType: TransactionType,
    transactionStatus: TransactionStatus,
    startDate: Date,
    endDate: Date
  ): Promise<{ data: Transaction[], totalCount: number, page: number, perPage: number }> {

    // Create query builder to handle complex filtering and pagination
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

    // Ensure the query checks transactions by userId or recipientId
    queryBuilder.where('(transaction.initiatior = :userId OR transaction.recipientId = :userId)', { userId });

    // Optional filter by transaction type (e.g., DEPOSIT, TRANSFER)
    if (transactionType) {
      queryBuilder.andWhere('transaction.transactionType = :transactionType', { transactionType });
    }

    // Optional filter by transaction staus (e.g., SUCCESS, FAILED)
    if (transactionStatus) {
      queryBuilder.andWhere('transaction.transactionType = :transactionType', { transactionType });
    }

    // Optional date range filter
    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    // Get total transaction count before pagination
    const totalCount = await queryBuilder.getCount();

    // Apply pagination with limit and skip
    queryBuilder
      .orderBy('transaction.createdAt', 'DESC') // Order by latest transaction
      .skip((page - 1) * limit) // Offset results based on page number
      .take(limit); // Limit the number of results

    const transactions = await queryBuilder.getMany();

    // If no transactions are found, throw a 404 error
    if (!transactions.length) throw new NotFoundException('No transactions found.');

    // Return the paginated data and the total count
    return {
      data: transactions,
      totalCount,
      page,
      perPage: limit
    };
  }
}
