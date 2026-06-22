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

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async update(id: number, input: Partial<User>): Promise<User> {
    if (Object.keys(input).length === 0) throw new Error('No fields to update');
    await this.repository.update(id, input);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    return updatedUser;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
