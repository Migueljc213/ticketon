import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class LoginUseCaseInputDto extends PartialClass<LoginUseCaseInputDto> {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
