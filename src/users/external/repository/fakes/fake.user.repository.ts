import User from 'src/users/domain/entity/User.entity';
import IUserRepository from 'src/users/domain/interface/user.repository.interface';

export default class FakeUserRepository implements IUserRepository {
    private users: User[] = [];
    
    async create(input: Partial<User>): Promise<User>{
        const user = new User()
        
        user.id = input.id!;
        user.name = input.name!;
        user.email = input.email!
        user.cpfCnpj = input.cpfCnpj!
        user.password = input.password!

        this.users.push(user)

        return user
  };

}
