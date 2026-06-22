import { IsEnum, IsOptional, IsString } from 'class-validator';
import PartialClass from 'src/domain/partial.class.base';

export default class UpdateBankAccountDto extends PartialClass<UpdateBankAccountDto> {
  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  agency?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsEnum(['corrente', 'poupanca'])
  accountType?: 'corrente' | 'poupanca';

  @IsOptional()
  @IsString()
  holderName?: string;

  @IsOptional()
  @IsString()
  holderCpfCnpj?: string;

  @IsOptional()
  @IsString()
  pixKey?: string | null;
}
