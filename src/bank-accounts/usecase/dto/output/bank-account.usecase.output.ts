import { AccountType } from '../../../domain/entity/BankAccount.entity';

export default class BankAccountUseCaseOutput {
  id: number;
  userId: number;
  bankCode: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  accountType: AccountType;
  holderName: string;
  holderCpfCnpj: string;
  pixKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}
