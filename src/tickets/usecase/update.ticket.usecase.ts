import { Inject, Injectable, Logger } from '@nestjs/common';
import type ITicketRepository from '../domain/interface/ticket.repository.interface';
import { TicketRepositoryToken } from '../ticket.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import UpdateTicketUseCaseInput from './dto/input/update.ticket.usecase.input';
import UpdateTicketUseCaseOutput from './dto/output/update.ticket.usecase.output';

@Injectable()
export default class UpdateTicketUseCase
  implements IUsecase<UpdateTicketUseCaseInput, UpdateTicketUseCaseOutput>
{
  private readonly logger = new Logger(UpdateTicketUseCase.name);

  constructor(
    @Inject(TicketRepositoryToken)
    private readonly repository: ITicketRepository,
  ) {}

  async run(input: UpdateTicketUseCaseInput): Promise<UpdateTicketUseCaseOutput> {
    this.logger.log('Updating ticket', input.id);

    const existingTicket = await this.repository.findById(input.id);
    if (!existingTicket) {
      throw new Error('Ticket not found');
    }

    const updateData: Partial<UpdateTicketUseCaseInput> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.quantityAvailable !== undefined)
      updateData.quantityAvailable = input.quantityAvailable;
    if (input.minPerOrder !== undefined) updateData.minPerOrder = input.minPerOrder;
    if (input.maxPerOrder !== undefined) updateData.maxPerOrder = input.maxPerOrder;
    if (input.saleStartDate !== undefined)
      updateData.saleStartDate = input.saleStartDate;
    if (input.saleEndDate !== undefined) updateData.saleEndDate = input.saleEndDate;
    if (input.ticketType !== undefined) updateData.ticketType = input.ticketType;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    return this.repository.update(input.id, updateData as Parameters<ITicketRepository['update']>[1]);
  }
}
