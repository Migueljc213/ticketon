import { Inject, Injectable, Logger } from '@nestjs/common';
import type IUserRepository from '../domain/interface/user.repository.interface';
import { UserRepositoryToken } from '../user.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import DeleteUserUseCaseInput from './dto/input/delete.user.usecase.input';

@Injectable()
export default class DeleteUserUseCase implements IUsecase<
  DeleteUserUseCaseInput,
  void
> {
  private readonly logger = new Logger(DeleteUserUseCase.name);

  constructor(
    @Inject(UserRepositoryToken) private readonly repository: IUserRepository,
  ) {}

  async run(input: DeleteUserUseCaseInput): Promise<void> {
    this.logger.log('Deleting user', input.id);

    // Check if user exists
    const existingUser = await this.repository.findById(input.id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    await this.repository.delete(input.id);
  }
}
