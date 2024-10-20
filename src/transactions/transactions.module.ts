import { Module } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Transaction, User])
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionsModule {}
