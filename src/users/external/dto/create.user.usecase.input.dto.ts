import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class CreateUserUseCaseInputDto extends PartialClass<CreateUserUseCaseInputDto> {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsOptional()
  @IsString()
  cpfCnpj?: string;
  @IsOptional()
  @IsString()
  gender?: string;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;
  @IsOptional()
  @IsString()
  neighborhood?: string;
}
