import BankAccount from '../../../domain/entity/BankAccount.entity';
import IBankAccountRepository from '../../../domain/interface/bank-account.repository.interface';

export default class FakeBankAccountRepository implements IBankAccountRepository {
  private records: BankAccount[] = [];
  private nextId = 1;

  async create(input: Partial<BankAccount>): Promise<BankAccount> {
    const account = new BankAccount();
    account.id = this.nextId++;
    account.userId = input.userId!;
    account.bankCode = input.bankCode!;
    account.bankName = input.bankName!;
    account.agency = input.agency!;
    account.accountNumber = input.accountNumber!;
    account.accountType = input.accountType!;
    account.holderName = input.holderName!;
    account.holderCpfCnpj = input.holderCpfCnpj!;
    account.pixKey = input.pixKey ?? null;
    account.createdAt = new Date();
    account.updatedAt = new Date();
    this.records.push(account);
    return account;
  }

  async findByUserId(userId: number): Promise<BankAccount | null> {
    return this.records.find((r) => r.userId === userId) ?? null;
  }

  async update(userId: number, input: Partial<BankAccount>): Promise<BankAccount> {
    const idx = this.records.findIndex((r) => r.userId === userId);
    if (idx === -1) throw new Error('Conta bancária não encontrada');
    for (const key of Object.keys(input) as (keyof BankAccount)[]) {
      if (input[key] !== undefined) {
        (this.records[idx] as any)[key] = input[key];
      }
    }
    this.records[idx].updatedAt = new Date();
    return this.records[idx];
  }

  async delete(userId: number): Promise<void> {
    this.records = this.records.filter((r) => r.userId !== userId);
  }
}
