import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type IUserRepository from '../domain/interface/user.repository.interface';
import { UserRepositoryToken } from '../user.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import CreateUserUseCaseInputDto from '../external/dto/create.user.usecase.input.dto';
import CreateUserUseCaseOutput from './dto/output/create.user.usecase.output';

@Injectable()
export default class CreateUserUseCase implements IUsecase<
  CreateUserUseCaseInputDto,
  CreateUserUseCaseOutput
> {
  private readonly logger = new Logger(CreateUserUseCase.name);
  constructor(
    @Inject(UserRepositoryToken) private readonly repository: IUserRepository,
  ) {}

  async run(
    input: CreateUserUseCaseInputDto,
  ): Promise<CreateUserUseCaseOutput> {
    this.logger.log('Starting CreateUseCase', input.email);

    // Check if user already exists
    const existingUser = await this.repository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(input.password, saltRounds);

    // Create user with hashed password
    return this.repository.create({
      ...input,
      password: hashedPassword,
    });
  }
}
