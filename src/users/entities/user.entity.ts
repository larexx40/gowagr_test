import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  firstname: string;

  @Column({ nullable: false })
  lastname: string;

  @Index()
  @Column({ unique: true, nullable: false })
  username: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: false, default: 0 })
  balance: number;

  @Column({ nullable: true })
  verificationOtp: number;

  @Column({ nullable: true })
  otpExpiresIn: Date;

  @Column({ nullable: true })
  passwordResetOtp: number;

  @Column({ nullable: true })
  passwordResetOtpExpiresIn: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.initiator)
  transactions: Transaction[];;

}