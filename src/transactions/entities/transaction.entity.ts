import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { TransactionType, TransactionStatus } from 'utils/enum';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.transactions)
    initiatior: User;

    @Index()
    @Column()
    initiatiorId: string;

    @ManyToOne(() => User, { nullable: true })
    recipient?: User;
    
    @Index()
    @Column({ nullable: true })
    recipientId?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: TransactionType })
    @Index()
    type: TransactionType;

    @Column({ type: 'enum', enum: TransactionStatus })
    @Index()
    status: TransactionStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}