import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class DepositDto {

    @ApiProperty({
        description: 'The amount to be deposited',
        example: 1000,
    })
    @IsNotEmpty({ message: "Amount is required" })
    @IsNumber({}, { message: 'Amount must be a valid number' })
    @IsPositive({ message: 'Amount must be a positive number' })
    @Min(1, { message: 'Amount must be at least 1' })
    amount: number;
}

export class TransferDto {

    @ApiProperty({
        description: 'The amount to be transferred',
        example: 500,
    })
    @IsNotEmpty({ message: "Amount is required" })
    @IsNumber({}, { message: 'Amount must be a valid number' })
    @IsPositive({ message: 'Amount must be a positive number' })
    @Min(1, { message: 'Amount must be at least 1' })
    amount: number;

    @ApiProperty({
        description: 'The username of the recipient who will receive the amount',
        example: 'john_doe',
    })
    @IsNotEmpty({ message: 'Recipient username is required' })
    @IsString({ message: 'Recipient username must be a string' })
    recipientUsername: string;
}