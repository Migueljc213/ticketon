import { IsEmail, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class UpdateUserUseCaseInputDto extends PartialClass<UpdateUserUseCaseInputDto> {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  cpfCnpj?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(120)
  age?: number;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  bankInfo?: string;
}
