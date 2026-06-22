import { AccountType } from '../../../domain/entity/BankAccount.entity';

export default class UpdateBankAccountUseCaseInput {
  userId: number;
  bankCode?: string;
  bankName?: string;
  agency?: string;
  accountNumber?: string;
  accountType?: AccountType;
  holderName?: string;
  holderCpfCnpj?: string;
  pixKey?: string | null;

  constructor(userId: number, data: Partial<UpdateBankAccountUseCaseInput>) {
    this.userId = userId;
    Object.assign(this, data);
  }
}
