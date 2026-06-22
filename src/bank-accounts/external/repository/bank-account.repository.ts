import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BankAccount from '../../domain/entity/BankAccount.entity';
import IBankAccountRepository from '../../domain/interface/bank-account.repository.interface';

@Injectable()
export default class BankAccountRepository implements IBankAccountRepository {
  constructor(
    @InjectRepository(BankAccount)
    private readonly repository: Repository<BankAccount>,
  ) {}

  async create(input: Partial<BankAccount>): Promise<BankAccount> {
    return this.repository.save(input);
  }

  async findByUserId(userId: number): Promise<BankAccount | null> {
    return this.repository.findOne({ where: { userId } });
  }

  async update(userId: number, input: Partial<BankAccount>): Promise<BankAccount> {
    await this.repository.update({ userId }, input);
    const updated = await this.findByUserId(userId);
    if (!updated) throw new Error('Conta bancária não encontrada após atualização');
    return updated;
  }

  async delete(userId: number): Promise<void> {
    await this.repository.delete({ userId });
  }
}
