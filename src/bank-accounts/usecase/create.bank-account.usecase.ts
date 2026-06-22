import { Inject, Injectable } from '@nestjs/common';
import IUsecase from 'src/common/interfaces/IUseCase';
import type IBankAccountRepository from '../domain/interface/bank-account.repository.interface';
import { BankAccountRepositoryToken } from '../bank-account.token';
import CreateBankAccountUseCaseInput from './dto/input/create.bank-account.usecase.input';
import BankAccountUseCaseOutput from './dto/output/bank-account.usecase.output';

@Injectable()
export default class CreateBankAccountUseCase
  implements IUsecase<CreateBankAccountUseCaseInput, BankAccountUseCaseOutput>
{
  constructor(
    @Inject(BankAccountRepositoryToken)
    private readonly repository: IBankAccountRepository,
  ) {}

  async run(input: CreateBankAccountUseCaseInput): Promise<BankAccountUseCaseOutput> {
    const existing = await this.repository.findByUserId(input.userId);
    if (existing) {
      // Upsert: atualiza ao invés de duplicar
      return this.repository.update(input.userId, input);
    }
    return this.repository.create(input);
  }
}
