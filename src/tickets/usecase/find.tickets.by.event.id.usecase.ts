import { Inject, Injectable, Logger } from '@nestjs/common';
import type ITicketRepository from '../domain/interface/ticket.repository.interface';
import { TicketRepositoryToken } from '../ticket.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindTicketsByEventIdUseCaseInput from './dto/input/find.tickets.by.event.id.usecase.input';
import FindTicketsByEventIdUseCaseOutput from './dto/output/find.tickets.by.event.id.usecase.output';

@Injectable()
export default class FindTicketsByEventIdUseCase
  implements
    IUsecase<
      FindTicketsByEventIdUseCaseInput,
      FindTicketsByEventIdUseCaseOutput
    >
{
  private readonly logger = new Logger(FindTicketsByEventIdUseCase.name);

  constructor(
    @Inject(TicketRepositoryToken)
    private readonly repository: ITicketRepository,
  ) {}

  async run(
    input: FindTicketsByEventIdUseCaseInput,
  ): Promise<FindTicketsByEventIdUseCaseOutput> {
    this.logger.log('Finding tickets for event', input.eventId);

    const tickets = await this.repository.findByEventId(input.eventId);

    return new FindTicketsByEventIdUseCaseOutput(tickets);
  }
}

