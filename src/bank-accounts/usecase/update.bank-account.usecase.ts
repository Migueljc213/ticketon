import { Inject, Injectable } from '@nestjs/common';
import IUsecase from 'src/common/interfaces/IUseCase';
import type IBankAccountRepository from '../domain/interface/bank-account.repository.interface';
import { BankAccountRepositoryToken } from '../bank-account.token';
import UpdateBankAccountUseCaseInput from './dto/input/update.bank-account.usecase.input';
import BankAccountUseCaseOutput from './dto/output/bank-account.usecase.output';

@Injectable()
export default class UpdateBankAccountUseCase
  implements IUsecase<UpdateBankAccountUseCaseInput, BankAccountUseCaseOutput>
{
  constructor(
    @Inject(BankAccountRepositoryToken)
    private readonly repository: IBankAccountRepository,
  ) {}

  async run(input: UpdateBankAccountUseCaseInput): Promise<BankAccountUseCaseOutput> {
    const { userId, ...fields } = input;
    const existing = await this.repository.findByUserId(userId);
    if (!existing) throw new Error('Conta bancária não encontrada para este usuário');
    return this.repository.update(userId, fields);
  }
}
