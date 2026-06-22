import BankAccount from '../entity/BankAccount.entity';

export default interface IBankAccountRepository {
  create(input: Partial<BankAccount>): Promise<BankAccount>;
  findByUserId(userId: number): Promise<BankAccount | null>;
  update(userId: number, input: Partial<BankAccount>): Promise<BankAccount>;
  delete(userId: number): Promise<void>;
}
