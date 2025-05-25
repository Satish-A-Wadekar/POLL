import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsISO8601,
  MaxLength,
  ArrayMinSize,
  Validate,
} from 'class-validator';
import { IsFutureDate } from 'src/validators/is-future-date.validator';

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  question: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options: string[];

  //@IsArray()
  //votedUsers: string[];

  //@IsISO8601()
  @IsDateString()
  @Validate(IsFutureDate, {
    message: 'Expiry date must be in the future',
  })
  expiryDate: Date;

  //@IsBoolean()
  //isExpired: boolean;
}
