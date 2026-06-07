import { Inject, Injectable, Logger } from '@nestjs/common';
import type IEventRepository from '../domain/interface/event.repository.interface';
import { EventRepositoryToken } from '../event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import CreateEventUseCaseInput from './dto/input/create.event.usecase.input';
import CreateEventUseCaseOutput from './dto/output/create.event.usecase.output';

@Injectable()
export default class CreateEventUseCase implements IUsecase<
  CreateEventUseCaseInput,
  CreateEventUseCaseOutput
> {
  private readonly logger = new Logger(CreateEventUseCase.name);

  constructor(
    @Inject(EventRepositoryToken)
    private readonly repository: IEventRepository,
  ) {}

  async run(input: CreateEventUseCaseInput): Promise<CreateEventUseCaseOutput> {
    this.logger.log('Creating event', input.title);

    return this.repository.create(input);
  }
}
