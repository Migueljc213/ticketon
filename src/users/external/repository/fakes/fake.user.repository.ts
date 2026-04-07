import User from 'src/users/domain/entity/User.entity';
import IUserRepository from 'src/users/domain/interface/user.repository.interface';

export default class FakeUserRepository implements IUserRepository {
  private users: User[] = [];
  private nextId = 1;

  async create(input: Partial<User>): Promise<User> {
    const user = new User();

    user.id = this.nextId++;
    user.name = input.name!;
    user.email = input.email!;
    user.cpfCnpj = input.cpfCnpj!;
    user.password = input.password!;
    user.bankInfo = input.bankInfo || null;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    this.users.push(user);

    return user;
  }

  async findById(id: number): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async update(id: number, input: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Only update fields that are explicitly provided
    Object.keys(input).forEach((key) => {
      if (input[key] !== undefined) {
        this.users[userIndex][key] = input[key];
      }
    });

    this.users[userIndex].updatedAt = new Date();

    return this.users[userIndex];
  }

  async delete(id: number): Promise<void> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
    }
  }
}
