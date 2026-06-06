import FakeUserRepository from 'src/users/external/repository/fakes/fake.user.repository';
import UpdateUserUseCase from '../update.user.usecase';
import UpdateUserUseCaseInputDto from 'src/users/external/dto/update.user.usecase.input.dto';
import UpdateUserUseCaseInput from '../dto/input/update.user.usecase.input';

describe('UpdateUser usecase', () => {
  it('should update a user and return the updated user', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const updateUser = new UpdateUserUseCase(fakeUserRepository);

    // Create a user first
    const createdUser = await fakeUserRepository.create({
      name: 'Original Name',
      email: 'original@test.com',
      cpfCnpj: '111111111111',
      password: 'password123',
    });

    const input = {
      id: createdUser.id,
      name: 'Updated Name',
    } as UpdateUserUseCaseInput;
    const updatedUser = await updateUser.run(input);

    expect(updatedUser.id).toBe(createdUser.id);
    expect(updatedUser.name).toBe('Updated Name');
    expect(updatedUser.email).toBe('original@test.com');
  });

  it('should throw error if user not found', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const updateUser = new UpdateUserUseCase(fakeUserRepository);

    const input = { id: 999, name: 'Updated Name' } as UpdateUserUseCaseInput;

    await expect(updateUser.run(input)).rejects.toThrow('User not found');
  });

  it('should throw error if email already in use', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const updateUser = new UpdateUserUseCase(fakeUserRepository);

    // Create two users
    const user1 = await fakeUserRepository.create({
      name: 'User 1',
      email: 'user1@test.com',
      cpfCnpj: '111111111111',
      password: 'password123',
    });

    await fakeUserRepository.create({
      name: 'User 2',
      email: 'user2@test.com',
      cpfCnpj: '222222222222',
      password: 'password123',
    });

    // Try to update user1's email to user2's email
    const input = {
      id: user1.id,
      email: 'user2@test.com',
    } as UpdateUserUseCaseInput;

    await expect(updateUser.run(input)).rejects.toThrow('Email already in use');
  });
});
