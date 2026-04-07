import FakeUserRepository from 'src/users/external/repository/fakes/fake.user.repository';
import FindUserByIdUseCase from '../find.user.by.id.usecase';
import FindUserByIdUseCaseInput from '../dto/input/find.user.by.id.usecase.input';

describe('FindUserById usecase', () => {
  it('should find a user by id and return it', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const findUserById = new FindUserByIdUseCase(fakeUserRepository);

    // Create a user first
    const createdUser = await fakeUserRepository.create({
      name: 'teste',
      email: 'test@jest.com',
      cpfCnpj: '111111111111',
      password: 'teste123',
    });

    const input = new FindUserByIdUseCaseInput(createdUser.id);
    const user = await findUserById.run(input);

    expect(user.id).toBe(createdUser.id);
    expect(user.name).toBe('teste');
    expect(user.email).toBe('test@jest.com');
  });

  it('should throw error if user not found', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const findUserById = new FindUserByIdUseCase(fakeUserRepository);

    const input = new FindUserByIdUseCaseInput(999);

    await expect(findUserById.run(input)).rejects.toThrow('User not found');
  });
});
