import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { TransactionType, TransactionStatus } from 'src/utils/enum';
import { ApiProperty } from '@nestjs/swagger'; // Import ApiProperty
import { Transform } from 'class-transformer';
import { toMiniProfile } from 'src/users/transformers/users.transform';
import { MiniProfile } from 'src/users/types/user.type';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        description: 'The unique identifier for the transaction',
        type: String,
    })
    id: string;

    @ManyToOne(() => User, (user) => user.transactions)
    @Transform(({ value }) => toMiniProfile(value))
    @ApiProperty({
        description: 'The user who initiated the transaction',
        type: Object,
        example: {
            firstname: 'John',
            lastname: 'Doe',
            username: 'johndoe',
        }
    })
    initiator: MiniProfile;

    @Index()
    @Column()
    @ApiProperty({
        description: 'The unique id of the user that initiate the transaction.',
        type: String,
    })
    initiatorId: string;

    @ManyToOne(() => User, { nullable: true })
    @Transform(({ value }) => toMiniProfile(value))
    @ApiProperty({
        description: 'The user who receives the transaction (optional)',
        type: Object,
        example: {
            firstname: 'John',
            lastname: 'Doe',
            username: 'johndoe',
        },
        nullable: true
    })
    recipient?: MiniProfile;

    @Index()
    @Column({ nullable: true })
    @ApiProperty({
        description: 'The unique identifier of the recipient user (optional)',
        type: String,
        nullable: true,
    })
    recipientId?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    @ApiProperty({
        description: 'The amount of money involved in the transaction',
        type: 'number',
    })
    amount: number;

    @Column({ type: 'enum', enum: TransactionType })
    @Index()
    @ApiProperty({
        description: 'The type of the transaction',
        enum: TransactionType, // Specify the enum type
    })
    type: TransactionType;

    @Column({ type: 'enum', enum: TransactionStatus })
    @Index()
    @ApiProperty({
        description: 'The current status of the transaction',
        enum: TransactionStatus, // Specify the enum type
    })
    status: TransactionStatus;

    @CreateDateColumn()
    @ApiProperty({
        description: 'The date when the transaction was created',
        type: String,
        format: 'date-time', // Specify the date format
    })
    createdAt: Date;

    @UpdateDateColumn()
    @ApiProperty({
        description: 'The date when the transaction was last updated',
        type: String,
        format: 'date-time', // Specify the date format
    })
    updatedAt: Date;
}
