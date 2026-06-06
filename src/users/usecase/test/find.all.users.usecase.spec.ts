import FakeUserRepository from 'src/users/external/repository/fakes/fake.user.repository';
import FindAllUsersUseCase from '../find.all.users.usecase';

describe('FindAllUsers usecase', () => {
  it('should return all users', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const findAllUsers = new FindAllUsersUseCase(fakeUserRepository);

    // Create some users
    await fakeUserRepository.create({
      name: 'User 1',
      email: 'user1@test.com',
      cpfCnpj: '111111111111',
      password: 'password1',
    });

    await fakeUserRepository.create({
      name: 'User 2',
      email: 'user2@test.com',
      cpfCnpj: '222222222222',
      password: 'password2',
    });

    const result = await findAllUsers.run();

    expect(result.users).toHaveLength(2);
    expect(result.users[0].name).toBe('User 1');
    expect(result.users[1].name).toBe('User 2');
  });

  it('should return empty array if no users exist', async () => {
    const fakeUserRepository = new FakeUserRepository();
    const findAllUsers = new FindAllUsersUseCase(fakeUserRepository);

    const result = await findAllUsers.run();

    expect(result.users).toHaveLength(0);
  });
});
