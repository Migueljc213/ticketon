import { Inject, Injectable, Logger } from '@nestjs/common';
import type IEventRepository from '../domain/interface/event.repository.interface';
import { EventRepositoryToken } from '../event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindEventByIdUseCaseInput from './dto/input/find.event.by.id.usecase.input';
import FindEventByIdUseCaseOutput from './dto/output/find.event.by.id.usecase.output';

@Injectable()
export default class FindEventByIdUseCase
  implements IUsecase<FindEventByIdUseCaseInput, FindEventByIdUseCaseOutput>
{
  private readonly logger = new Logger(FindEventByIdUseCase.name);

  constructor(
    @Inject(EventRepositoryToken)
    private readonly repository: IEventRepository,
  ) {}

  async run(
    input: FindEventByIdUseCaseInput,
  ): Promise<FindEventByIdUseCaseOutput> {
    this.logger.log('Finding event by id', input.id);

    const event = await this.repository.findById(input.id);

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }
}
