import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';
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
  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;
  @IsObject()
  bankInfo: string;
}
