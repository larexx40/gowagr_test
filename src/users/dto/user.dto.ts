import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'The user\'s first name',
    example: 'Lanre',
    required: false, 
  })
  @IsOptional()
  @IsString({ message: 'Firstname must be a valid string' })
  firstname?: string;

  @ApiProperty({
    description: 'The user\'s last name',
    example: 'Doe',
    required: false, 
  })
  @IsOptional()
  @IsString({ message: 'Lastname must be a valid string' })
  lastname?: string;

  @ApiProperty({
    description: 'The user\'s username',
    example: 'Lanre_doe',
    required: false, 
  })
  @IsOptional()
  @IsString({ message: 'Username must be a valid string' })
  username?: string;
}