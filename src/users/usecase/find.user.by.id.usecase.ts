import { Inject, Injectable, Logger } from '@nestjs/common';
import type IUserRepository from '../domain/interface/user.repository.interface';
import { UserRepositoryToken } from '../user.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindUserByIdUseCaseInput from './dto/input/find.user.by.id.usecase.input';
import FindUserByIdUseCaseOutput from './dto/output/find.user.by.id.usecase.output';

@Injectable()
export default class FindUserByIdUseCase
  implements IUsecase<FindUserByIdUseCaseInput, FindUserByIdUseCaseOutput>
{
  private readonly logger = new Logger(FindUserByIdUseCase.name);

  constructor(
    @Inject(UserRepositoryToken) private readonly repository: IUserRepository,
  ) {}

  async run(input: FindUserByIdUseCaseInput): Promise<FindUserByIdUseCaseOutput> {
    this.logger.log('Finding user by id', input.id);

    const user = await this.repository.findById(input.id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
