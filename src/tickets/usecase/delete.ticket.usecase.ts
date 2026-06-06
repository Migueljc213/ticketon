import { Inject, Injectable, Logger } from '@nestjs/common';
import type ITicketRepository from '../domain/interface/ticket.repository.interface';
import { TicketRepositoryToken } from '../ticket.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import DeleteTicketUseCaseInput from './dto/input/delete.ticket.usecase.input';

@Injectable()
export default class DeleteTicketUseCase
  implements IUsecase<DeleteTicketUseCaseInput, void>
{
  private readonly logger = new Logger(DeleteTicketUseCase.name);

  constructor(
    @Inject(TicketRepositoryToken)
    private readonly repository: ITicketRepository,
  ) {}

  async run(input: DeleteTicketUseCaseInput): Promise<void> {
    this.logger.log('Deleting ticket', input.id);

    const existingTicket = await this.repository.findById(input.id);
    if (!existingTicket) {
      throw new Error('Ticket not found');
    }

    await this.repository.delete(input.id);
  }
}
