import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class VotePollDto {
  @IsNotEmpty()
  @IsString()
  pollId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: 'Option index must be a positive number' })
  optionIndex: number;

  @IsString()
  @IsOptional()
  userId?: string;
}
