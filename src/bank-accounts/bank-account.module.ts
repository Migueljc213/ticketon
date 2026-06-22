import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import BankAccount from './domain/entity/BankAccount.entity';
import BankAccountRepository from './external/repository/bank-account.repository';
import {
  BankAccountRepositoryToken,
  CreateBankAccountToken,
  FindBankAccountToken,
  UpdateBankAccountToken,
} from './bank-account.token';
import BankAccountController from './bank-account.controller';
import CreateBankAccountUseCase from './usecase/create.bank-account.usecase';
import FindBankAccountUseCase from './usecase/find.bank-account.usecase';
import UpdateBankAccountUseCase from './usecase/update.bank-account.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount])],
  controllers: [BankAccountController],
  providers: [
    { provide: BankAccountRepositoryToken, useClass: BankAccountRepository },
    { provide: CreateBankAccountToken, useClass: CreateBankAccountUseCase },
    { provide: FindBankAccountToken, useClass: FindBankAccountUseCase },
    { provide: UpdateBankAccountToken, useClass: UpdateBankAccountUseCase },
  ],
})
export default class BankAccountModule {}
