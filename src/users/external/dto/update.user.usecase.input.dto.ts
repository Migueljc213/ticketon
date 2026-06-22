import { IsEmail, IsOptional, IsString } from 'class-validator';
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
}
