import { Inject, Injectable, Logger } from '@nestjs/common';
import type ITicketRepository from '../domain/interface/ticket.repository.interface';
import { TicketRepositoryToken } from '../ticket.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindAllTicketsUseCaseOutput from './dto/output/find.all.tickets.usecase.output';

@Injectable()
export default class FindAllTicketsUseCase
  implements IUsecase<void, FindAllTicketsUseCaseOutput>
{
  private readonly logger = new Logger(FindAllTicketsUseCase.name);

  constructor(
    @Inject(TicketRepositoryToken)
    private readonly repository: ITicketRepository,
  ) {}

  async run(): Promise<FindAllTicketsUseCaseOutput> {
    this.logger.log('Finding all tickets');

    const tickets = await this.repository.findAll();

    return new FindAllTicketsUseCaseOutput(tickets);
  }
}
