import User from 'src/users/domain/entity/User.entity';

export default class FindAllUsersUseCaseOutput {
  users: User[];

  constructor(users: User[]) {
    this.users = users;
  }
}
