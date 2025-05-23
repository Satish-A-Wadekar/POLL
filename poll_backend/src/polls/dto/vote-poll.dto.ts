import { IsInt, Min, IsString, IsOptional } from 'class-validator';

export class VotePollDto {
  @IsString()
  pollId: string;

  @IsInt()
  @Min(0)
  optionIndex: number;

  @IsString()
  @IsOptional()
  userId?: string;
}
