import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type IUserRepository from '../domain/interface/user.repository.interface';
import { UserRepositoryToken } from '../user.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import UpdateUserUseCaseInput from './dto/input/update.user.usecase.input';
import UpdateUserUseCaseOutput from './dto/output/update.user.usecase.output';

@Injectable()
export default class UpdateUserUseCase implements IUsecase<
  UpdateUserUseCaseInput,
  UpdateUserUseCaseOutput
> {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject(UserRepositoryToken) private readonly repository: IUserRepository,
  ) {}

  async run(input: UpdateUserUseCaseInput): Promise<UpdateUserUseCaseOutput> {
    this.logger.log('Updating user', input.id);

    const existingUser = await this.repository.findById(input.id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (input.email && input.email !== existingUser.email) {
      const userWithEmail = await this.repository.findByEmail(input.email);
      if (userWithEmail) {
        throw new Error('Email already in use');
      }
    }

    const updateData: Partial<UpdateUserUseCaseInput> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.cpfCnpj !== undefined) updateData.cpfCnpj = input.cpfCnpj;
    if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.age !== undefined) updateData.age = input.age;
    if (input.neighborhood !== undefined) updateData.neighborhood = input.neighborhood;
    if (input.bankInfo !== undefined) updateData.bankInfo = input.bankInfo;
    if (input.role !== undefined) updateData.role = input.role;

    if (input.password !== undefined) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(input.password, saltRounds);
    }

    if (Object.keys(updateData).length === 0) {
      return existingUser;
    }

    return this.repository.update(input.id, updateData);
  }
}
