import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TransactionType, TransactionStatus } from 'utils/enum';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.transactions)
  initiatior: User; 

  @ManyToOne(() => User, { nullable: true })
  recipient?: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({type: 'enum', enum: TransactionStatus})
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date; 
  
  @UpdateDateColumn()
  updatedAt: Date;
}