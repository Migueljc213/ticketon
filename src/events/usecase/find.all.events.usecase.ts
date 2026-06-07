import { Inject, Injectable, Logger } from '@nestjs/common';
import type IEventRepository from '../domain/interface/event.repository.interface';
import { EventRepositoryToken } from '../event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindAllEventsUseCaseOutput from './dto/output/find.all.events.usecase.output';

@Injectable()
export default class FindAllEventsUseCase implements IUsecase<
  void,
  FindAllEventsUseCaseOutput
> {
  private readonly logger = new Logger(FindAllEventsUseCase.name);

  constructor(
    @Inject(EventRepositoryToken)
    private readonly repository: IEventRepository,
  ) {}

  async run(): Promise<FindAllEventsUseCaseOutput> {
    this.logger.log('Finding all events');

    const events = await this.repository.findAll();

    return new FindAllEventsUseCaseOutput(events);
  }
}
