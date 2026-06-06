import FakeUserRepository from 'src/users/external/repository/fakes/fake.user.repository';
import DeleteUserUseCase from '../delete.user.usecase';
import DeleteUserUseCaseInput from '../dto/input/delete.user.usecase.input';

describe('DeleteUser usecase', () => {
  it('should delete a user successfully', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const deleteUser = new DeleteUserUseCase(fakeUserRepository);

    // Create a user first
    const createdUser = await fakeUserRepository.create({
      name: 'teste',
      email: 'test@jest.com',
      cpfCnpj: '111111111111',
      password: 'teste123',
    });

    const input = new DeleteUserUseCaseInput(createdUser.id);
    await deleteUser.run(input);

    // Verify user was deleted
    const foundUser = await fakeUserRepository.findById(createdUser.id);
    expect(foundUser).toBeNull();
  });

  it('should throw error if user not found', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const deleteUser = new DeleteUserUseCase(fakeUserRepository);

    const input = new DeleteUserUseCaseInput(999);

    await expect(deleteUser.run(input)).rejects.toThrow('User not found');
  });
});
