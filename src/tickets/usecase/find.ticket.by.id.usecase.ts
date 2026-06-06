import { Inject, Injectable, Logger } from '@nestjs/common';
import type ITicketRepository from '../domain/interface/ticket.repository.interface';
import { TicketRepositoryToken } from '../ticket.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindTicketByIdUseCaseInput from './dto/input/find.ticket.by.id.usecase.input';
import FindTicketByIdUseCaseOutput from './dto/output/find.ticket.by.id.usecase.output';

@Injectable()
export default class FindTicketByIdUseCase
  implements IUsecase<FindTicketByIdUseCaseInput, FindTicketByIdUseCaseOutput>
{
  private readonly logger = new Logger(FindTicketByIdUseCase.name);

  constructor(
    @Inject(TicketRepositoryToken)
    private readonly repository: ITicketRepository,
  ) {}

  async run(
    input: FindTicketByIdUseCaseInput,
  ): Promise<FindTicketByIdUseCaseOutput> {
    this.logger.log('Finding ticket by id', input.id);

    const ticket = await this.repository.findById(input.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }
}
