import { Controller, Post, Body, Param, Get, Query, UseGuards, Req, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DepositDto, TransferDto } from './dto/transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { TransactionService } from './transactions.service';
import { RequestWithAuth } from 'src/auth/types/auth.type';
import { TransactionStatus, TransactionType } from 'src/utils/enum';
;

@ApiTags('Transactions')
@ApiBearerAuth() // Indicates that the endpoints require JWT authentication
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  /**
   * Deposit an amount to my account.
   * @param {string} userId - ID of the user making the deposit (inferred from the JWT token).
   * @param {DepositDto} depositDto - The deposit data.
   * @returns {Promise<Transaction>} - The created deposit transaction.
   */
  @Post('deposit')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Deposit an amount to a my account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Deposit transaction created successfully',
    type: Transaction,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request, operation cannot be performed',
  })
  async deposit(
    @Req() req: RequestWithAuth,
    @Body() depositDto: DepositDto
  ): Promise<{ status: boolean; message: string; data: Transaction }> {
    const userId = req.user.userId;
    const transaction = await this.transactionService.deposit(userId, depositDto);

    return {
      status: true,
      message: "Deposit transaction created successfully",
      data: transaction,
    };
  }

  /**
   * Transfers funds between two users using their usernames.
   * @param {string} userName - ID of the user initiating the transfer (inferred from the JWT token).
   * @param {TransferDto} transferDto - The transfer data.
   * @returns {Promise<Transaction>} - The created transfer transaction.
   */
  @Post('transfer')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Transfer funds to another user using username' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transfer transaction created successfully',
    type: Transaction,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sender or recipient not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Insufficient balance or bad request',
  })
  async transfer(
    @Req() req: RequestWithAuth,
    @Body() transferDto: TransferDto
  ): Promise<{ status: boolean; message: string; data: Transaction }> {
    const userId = req.user.userId
    const transaction = await this.transactionService.transfer(userId, transferDto);

    return {
      status: true,
      message: "Money sent successfully",
      data: transaction,
    };
  }

  /**
   * Retrieves all transactions of a specific user with pagination and filtering.
   * @param {number} [page=1] - The page number for pagination.
   * @param {number} [limit=10] - The number of transactions per page.
   * @param {TransactionType} [transactionType] - Type of transaction to filter.
   * @param {TransactionStatus} [transactionStatus] - Status of the transaction to filter.
   * @param {Date} [startDate] - Start date for filtering.
   * @param {Date} [endDate] - End date for filtering.
   * @returns {Promise<{ data: Transaction[], totalCount: number, page: number, perPage: number }>} - The list of transactions.
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'The page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'The number of transactions per page' })
  @ApiQuery({ name: 'transactionType', required: false, type: String, enum: TransactionType, description: 'Type of transaction to filter' })
  @ApiQuery({ name: 'transactionStatus', required: false, type: String, enum: TransactionStatus, description: 'Status of the transaction to filter' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for filtering (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for filtering (ISO format)' })
  @ApiOperation({ summary: 'Get all transactions for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions retrieved successfully',
    type: [Transaction],
  })
  @ApiResponse({
    status: 404,
    description: 'No transactions found for this user',
  })
  async getAllUserTransactions(
    @Req() req: RequestWithAuth,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('transactionType') transactionType?: TransactionType,
    @Query('transactionStatus') transactionStatus?: TransactionStatus,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ): Promise<{ status: boolean; message: string; data: Transaction[], totalCount: number, page: number, perPage: number }> {
    const userId = req.user.userId;
    const transactions = await this.transactionService.getAllUserTransactions(userId, page = 1, limit = 10, transactionType, transactionStatus, startDate, endDate);

    return {
      status: true,
      message: "List of transactions retrieved successfully",
      data: transactions.data,
      totalCount: transactions.totalCount,
      page: transactions.page,
      perPage: transactions.perPage,
    };
  }

  /**
   * Retrieves all transfer transactions of a specific user with pagination and filtering.
   * @param {number} [page=1] - The page number for pagination.
   * @param {number} [limit=10] - The number of transactions per page.
   * @param {TransactionStatus} [transactionStatus] - Status of the transaction to filter.
   * @param {Date} [startDate] - Start date for filtering.
   * @param {Date} [endDate] - End date for filtering.
   * @returns {Promise<{ data: Transaction[], totalCount: number, page: number, perPage: number }>} - The list of transactions.
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'The page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'The number of transactions per page' })
  @ApiQuery({ name: 'transactionStatus', required: false, type: String, enum: TransactionStatus, description: 'Status of the transaction to filter' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for filtering (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for filtering (ISO format)' })
  @ApiOperation({ summary: 'Get all transactions for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'List of transfers retrieved successfully',
    type: [Transaction],
  })
  @ApiResponse({
    status: 404,
    description: 'No transactions found for this user',
  })
  async getAllUserTransfers(
    @Req() req: RequestWithAuth,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('transactionStatus') transactionStatus?: TransactionStatus,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ): Promise<{ status: boolean; message: string; data: Transaction[], totalCount: number, page: number, perPage: number }> {
    const userId = req.user.userId;
    const transactions = await this.transactionService.getAllUserTransfers(userId, page = 1, limit = 10, transactionStatus, startDate, endDate);

    return {
      status: true,
      message: "List of transactions retrieved successfully",
      data: transactions.data,
      totalCount: transactions.totalCount,
      page: transactions.page,
      perPage: transactions.perPage,
    };
  }
}
