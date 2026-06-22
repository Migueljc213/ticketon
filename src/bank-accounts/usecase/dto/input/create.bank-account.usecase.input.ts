import { AccountType } from '../../../domain/entity/BankAccount.entity';

export default class CreateBankAccountUseCaseInput {
  userId: number;
  bankCode: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  accountType: AccountType;
  holderName: string;
  holderCpfCnpj: string;
  pixKey?: string | null;

  constructor(data: CreateBankAccountUseCaseInput) {
    Object.assign(this, data);
  }
}
