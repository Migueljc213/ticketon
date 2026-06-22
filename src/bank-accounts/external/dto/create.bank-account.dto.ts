import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class CreateBankAccountDto extends PartialClass<CreateBankAccountDto> {
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  agency: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsEnum(['corrente', 'poupanca'])
  accountType: 'corrente' | 'poupanca';

  @IsString()
  @IsNotEmpty()
  holderName: string;

  @IsString()
  @IsNotEmpty()
  holderCpfCnpj: string;

  @IsOptional()
  @IsString()
  pixKey?: string | null;
}
