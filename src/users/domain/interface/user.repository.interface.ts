import User from '../entity/User.entity';

export default interface IUserRepository {
  create(input: Partial<User>): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: number, input: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
}
