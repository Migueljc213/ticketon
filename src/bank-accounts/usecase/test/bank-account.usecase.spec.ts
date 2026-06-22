import FakeBankAccountRepository from 'src/bank-accounts/external/repository/fakes/fake.bank-account.repository';
import CreateBankAccountUseCase from '../create.bank-account.usecase';
import FindBankAccountUseCase from '../find.bank-account.usecase';
import UpdateBankAccountUseCase from '../update.bank-account.usecase';
import CreateBankAccountUseCaseInput from '../dto/input/create.bank-account.usecase.input';
import FindBankAccountUseCaseInput from '../dto/input/find.bank-account.usecase.input';
import UpdateBankAccountUseCaseInput from '../dto/input/update.bank-account.usecase.input';

const makeSut = () => {
  const repo = new FakeBankAccountRepository();
  return {
    repo,
    create: new CreateBankAccountUseCase(repo),
    find: new FindBankAccountUseCase(repo),
    update: new UpdateBankAccountUseCase(repo),
  };
};

const baseInput = (): CreateBankAccountUseCaseInput =>
  new CreateBankAccountUseCaseInput({
    userId: 1,
    bankCode: '341',
    bankName: 'Itaú',
    agency: '1234',
    accountNumber: '56789-0',
    accountType: 'corrente',
    holderName: 'João Silva',
    holderCpfCnpj: '000.000.000-00',
    pixKey: 'joao@email.com',
  });

describe('CreateBankAccountUseCase', () => {
  it('should create a bank account and return correct fields', async () => {
    const { create } = makeSut();
    const account = await create.run(baseInput());

    expect(account.id).toBe(1);
    expect(account.userId).toBe(1);
    expect(account.bankCode).toBe('341');
    expect(account.bankName).toBe('Itaú');
    expect(account.agency).toBe('1234');
    expect(account.accountNumber).toBe('56789-0');
    expect(account.accountType).toBe('corrente');
    expect(account.holderName).toBe('João Silva');
    expect(account.holderCpfCnpj).toBe('000.000.000-00');
    expect(account.pixKey).toBe('joao@email.com');
  });

  it('should upsert (update) if bank account already exists for user', async () => {
    const { create } = makeSut();
    await create.run(baseInput());

    const updated = await create.run(
      new CreateBankAccountUseCaseInput({ ...baseInput(), bankCode: '001', bankName: 'BB' }),
    );

    expect(updated.bankCode).toBe('001');
    expect(updated.bankName).toBe('BB');
  });
});

describe('FindBankAccountUseCase', () => {
  it('should return null when no account exists for user', async () => {
    const { find } = makeSut();
    const result = await find.run(new FindBankAccountUseCaseInput(99));
    expect(result).toBeNull();
  });

  it('should return the account for the correct user', async () => {
    const { create, find } = makeSut();
    await create.run(baseInput());

    const result = await find.run(new FindBankAccountUseCaseInput(1));
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(1);
    expect(result!.bankCode).toBe('341');
  });
});

describe('UpdateBankAccountUseCase', () => {
  it('should throw if account does not exist', async () => {
    const { update } = makeSut();
    await expect(
      update.run(new UpdateBankAccountUseCaseInput(99, { bankName: 'Nubank' })),
    ).rejects.toThrow('Conta bancária não encontrada para este usuário');
  });

  it('should update only provided fields', async () => {
    const { create, update } = makeSut();
    await create.run(baseInput());

    const result = await update.run(
      new UpdateBankAccountUseCaseInput(1, { pixKey: 'nova@pix.com', bankName: 'Nubank' }),
    );

    expect(result.pixKey).toBe('nova@pix.com');
    expect(result.bankName).toBe('Nubank');
    expect(result.bankCode).toBe('341'); // não mudou
    expect(result.agency).toBe('1234'); // não mudou
  });
});
