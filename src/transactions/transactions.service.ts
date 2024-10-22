import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, EntityManager } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus, TransactionType } from 'src/utils/enum';
import { DepositDto, TransferDto } from './dto/transaction.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { toMiniProfile } from 'src/users/transformers/users.transform';


@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  /**
   * Retrieves the user's balance, utilizing caching for improved performance.
   * If the balance is cached, it is returned from the cache. If not, it fetches
   * the balance from the database, caches it for 10 minutes, and then returns it.
   *
   * @param {string} userId - The unique identifier of the user.
   * @returns {Promise<number>} The user's balance.
   * @throws {NotFoundException} If the user is not found in the database.
   */
  async getUserBalance(userId: string): Promise<number> {
    const cacheKey = `user_balance_${userId}`;

    // Check if the balance is cached
    const cachedBalance = await this.cacheManager.get<number>(cacheKey);
    if (cachedBalance) {
      console.log("Cache hit");
      return cachedBalance; // Return cached balance
    }

    // If balance is not cached, fetch from database
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const balance = user.balance;

    // Cache the balance for 10 mins (600000 milliseconds)
    this.cacheUserBalance(userId, balance)

    return balance;
  }

  private async cacheUserBalance(userId: string, balance: number){
    const cacheKey = `user_balance_${userId}`;
    // Cache the balance for 10 mins (600000 milliseconds)
    await this.cacheManager.set(cacheKey, balance, 600000 );
    return cacheKey;
  }

  /**
   * Deposit an amount to a user's account and record a transaction
   * @param userId - ID of the user making the deposit
   * @param amount - Amount to be deposited
    * @throws {NotFoundException} - Throws an error if user not found.
    * @throws {BadRequestException} - Throws an error if transaction cannot go through due to locking.
   */
  async deposit(userId: string, depositDto: DepositDto): Promise<Transaction> {
    const { amount } = depositDto;
    console.log("Amount: ", amount)

    // Start a transaction block 
    //this will automatically rollback the entire transaction if any error occur.
    const res =  await this.transactionRepository.manager.transaction(async (entityManager: EntityManager) => {
      // Lock the user row to prevent race conditions
      const lockedUser = await entityManager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: userId })
        .getOne();

      if (!lockedUser) {
        throw new BadRequestException('Cannot perform operation at the moment, please try again later.');
      }

      // Update the user's balance
      console.log('Before saving user balance:', lockedUser.balance);
      // Update the user's balance and ensure proper precision handling
      const updatedBalance = parseFloat((Number(lockedUser.balance) + Number(amount)).toFixed(2));
      lockedUser.balance = updatedBalance;

      // Save updated user balance and create a deposit transaction record for the user
      await entityManager.save(lockedUser);
      console.log('After saving user balance:', lockedUser.balance);

      // Record the deposit transaction
      const transaction = new Transaction();
      transaction.initiatorId = lockedUser.id;
      transaction.initiator= toMiniProfile(lockedUser);
      transaction.amount = amount;
      transaction.type = TransactionType.DEPOSIT;
      transaction.status = TransactionStatus.SUCCESS

      //cache user balance
      this.cacheUserBalance(userId, lockedUser.balance)

      // Save the transaction
      return await entityManager.save(transaction);
    });

    return res;
  }

  /**
   * Transfers funds between two users using their usernames.
   * @param {TransferDto} transferDto - The transfer data.
   * @returns {Promise<Transaction>} - The created transfer transaction.
    * @throws {NotFoundException} - Throws an error if sender/receiver not found.
    * @throws {BadRequestException} - Throws an error if transaction cannot go through due to locking.
    * @throws {BadRequestException} - Throws an error if sender has insufficiennt balance.
   */
  async transfer(userId: string, transferDto: TransferDto): Promise<Transaction> {
    const { recipientUsername, amount } = transferDto;

    const sender = await this.userRepository.findOne({ where: { id: userId } });
    const recipient = await this.userRepository.findOne({ where: { username: recipientUsername } });

    if (!sender) throw new NotFoundException('Sender not found');
    if (!recipient) throw new NotFoundException('Recipient not found');
    if(sender.username === recipient.username) throw new BadRequestException("You cannot transfer to yourself")

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

      if(!lockedRecipient || !lockedSender) throw new BadRequestException("Cannot perform operation at the moment, please try again later.")
      if (lockedSender.balance < amount) throw new BadRequestException('Insufficient balance');

      // Deduct amount from sender
      const senderBalance = parseFloat((Number(lockedSender.balance) - Number(amount)).toFixed(2));
      lockedSender.balance = senderBalance;
      await entityManager.save(lockedSender);

      // Add amount to recipient
      const receiverBalance = parseFloat((Number(lockedRecipient.balance) + Number(amount)).toFixed(2));
      lockedRecipient.balance =  receiverBalance;
      await entityManager.save(lockedRecipient);

      // Record the transaction
      const transaction = new Transaction();
      transaction.initiatorId = sender.id;
      transaction.initiator= toMiniProfile(sender);
      transaction.recipientId = recipient.id;
      transaction.recipient= toMiniProfile(recipient);
      transaction.amount = amount;
      transaction.type = TransactionType.TRANSFER;
      transaction.status = TransactionStatus.SUCCESS

      
      //cache sender and receiver balance
      console.log("Send Balance: ", lockedSender.balance)
      console.log("Receiv Balance: ", lockedRecipient.balance)
      this.cacheUserBalance(lockedSender.id, senderBalance)
      this.cacheUserBalance(lockedRecipient.id, receiverBalance)

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
    page: number,
    limit: number,
    transactionType: TransactionType,
    transactionStatus: TransactionStatus,
    startDate: Date,
    endDate: Date
  ): Promise<{ data: Transaction[], totalCount: number, page: number, perPage: number }> {

    // Create query builder to handle complex filtering and pagination
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

    // Ensure the query checks transactions by userId or recipientId
    queryBuilder.where('(transaction.initiator = :userId OR transaction.recipientId = :userId)', { userId });

    // Optional filter by transaction type (e.g., DEPOSIT, TRANSFER)
    if (transactionType) {
      queryBuilder.andWhere('transaction.type = :transactionType', { transactionType });
    }

    // Optional filter by transaction staus (e.g., SUCCESS, FAILED)
    if (transactionStatus) {
      queryBuilder.andWhere('transaction.status = :transactionStatus', { transactionStatus });
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
    const skip = (page - 1) * limit || 0;
    console.log("SKip: ",skip)
    queryBuilder
      .orderBy('transaction.createdAt', 'DESC') // Order by latest transaction
      .skip(skip) // Offset results based on page number
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

   /**
 * Retrieves all transferf transactions of a specific user with pagination, filtering by status, and date range.
 * 
 * @param {string} userId - The user ID (can be initiator or recipient of the transaction).
 * @param {number} [page=1] - The page number for pagination.
 * @param {number} [limit=10] - The number of transactions per page.
 * @param {TransactionStatus} [transactionStatus] - The status of the transaction to filter by (e.g., SUCCESS, FAILED).
 * @param {Date} [startDate] - The start date to filter transactions by creation date.
 * @param {Date} [endDate] - The end date to filter transactions by creation date.
 * @returns {Promise<{ data: Transaction[], totalCount: number, page: number, perPage: number }>} - The list of transactions, total count, and pagination information.
 * @throws {NotFoundException} - Throws if no transactions are found for the user.
 */
  async getAllUserTransfers(
    userId: string,
    page: number,
    limit: number,
    transactionStatus: TransactionStatus,
    startDate: Date,
    endDate: Date
  ): Promise<{ data: Transaction[], totalCount: number, page: number, perPage: number }> {

    // Create query builder to handle complex filtering and pagination
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .andWhere('transaction.type = :transactionType', { transactionType: TransactionType.TRANSFER });

    // Ensure the query checks transactions by userId or recipientId
    queryBuilder.where('(transaction.initiator = :userId OR transaction.recipientId = :userId)', { userId });

    // Optional filter by transaction staus (e.g., SUCCESS, FAILED)
    if (transactionStatus) {
      queryBuilder.andWhere('transaction.status = :transactionStatus', { transactionStatus });
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
    const skip = (page - 1) * limit || 0;
    console.log("SKip: ",skip)
    queryBuilder
      .orderBy('transaction.createdAt', 'DESC') // Order by latest transaction
      .skip(skip) // Offset results based on page number
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
