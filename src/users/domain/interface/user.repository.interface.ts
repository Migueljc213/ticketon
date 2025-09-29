import User from '../entity/User.entity';

export default interface IUserRepository {
  create(input: Partial<User>): Promise<User>;
}
