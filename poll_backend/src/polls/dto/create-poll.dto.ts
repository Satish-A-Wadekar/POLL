import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  options: string[];

  @IsArray()
  votedUsers: string[];

  @IsDateString()
  expiryDate: Date;

  @IsBoolean()
  isExpired: boolean;
}
