import { Inject, Injectable } from '@nestjs/common';
import IUsecase from 'src/common/interfaces/IUseCase';
import type IBankAccountRepository from '../domain/interface/bank-account.repository.interface';
import { BankAccountRepositoryToken } from '../bank-account.token';
import FindBankAccountUseCaseInput from './dto/input/find.bank-account.usecase.input';
import BankAccountUseCaseOutput from './dto/output/bank-account.usecase.output';

@Injectable()
export default class FindBankAccountUseCase
  implements IUsecase<FindBankAccountUseCaseInput, BankAccountUseCaseOutput | null>
{
  constructor(
    @Inject(BankAccountRepositoryToken)
    private readonly repository: IBankAccountRepository,
  ) {}

  async run(input: FindBankAccountUseCaseInput): Promise<BankAccountUseCaseOutput | null> {
    return this.repository.findByUserId(input.userId);
  }
}
