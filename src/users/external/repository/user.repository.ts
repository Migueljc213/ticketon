import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/users/domain/entity/User.entity';
import IUserRepository from 'src/users/domain/interface/user.repository.interface';
import { Repository } from 'typeorm';

@Injectable()
export default class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async create(input: Partial<User>): Promise<User> {
    return this.repository.save(input);
  }

  async findByEmail(input: Partial<User>): Promise<User | null> {
    return this.repository.findOneBy({ email: input.email });
  }
}
