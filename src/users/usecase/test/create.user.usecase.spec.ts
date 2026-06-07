import FakeUserRepository from 'src/users/external/repository/fakes/fake.user.repository';
import CreateUserUseCase from '../create.user.usecase';
import CreateUserUseCaseInputDto from 'src/users/external/dto/create.user.usecase.input.dto';

describe('Create user usecase', () => {
  it('should create a user and return it with the correct properties and values', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const createUser = new CreateUserUseCase(fakeUserRepository);

    const input = {
      name: 'teste',
      email: 'test@jest.com',
      cpfCnpj: '111111111111',
      password: 'teste123',
    };

    const user = await createUser.run(input);

    expect(user.name).toBe('teste');
    expect(user.email).toBe('test@jest.com');
    expect(user.cpfCnpj).toBe('111111111111');
    expect(user.id).toBe(1);
  });
});
