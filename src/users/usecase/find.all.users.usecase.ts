import { Inject, Injectable, Logger } from '@nestjs/common';
import type IUserRepository from '../domain/interface/user.repository.interface';
import { UserRepositoryToken } from '../user.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindAllUsersUseCaseOutput from './dto/output/find.all.users.usecase.output';

@Injectable()
export default class FindAllUsersUseCase
  implements IUsecase<void, FindAllUsersUseCaseOutput>
{
  private readonly logger = new Logger(FindAllUsersUseCase.name);

  constructor(
    @Inject(UserRepositoryToken) private readonly repository: IUserRepository,
  ) {}

  async run(): Promise<FindAllUsersUseCaseOutput> {
    this.logger.log('Finding all users');

    const users = await this.repository.findAll();

    return new FindAllUsersUseCaseOutput(users);
  }
}
