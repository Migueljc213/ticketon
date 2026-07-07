import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type ITicketRepository from '../domain/interface/ticket.repository.interface';
import type IEventRepository from 'src/events/domain/interface/event.repository.interface';
import { TicketRepositoryToken } from '../ticket.token';
import { EventRepositoryToken } from 'src/events/event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import CreateTicketUseCaseInput from './dto/input/create.ticket.usecase.input';
import CreateTicketUseCaseOutput from './dto/output/create.ticket.usecase.output';

@Injectable()
export default class CreateTicketUseCase implements IUsecase<
  CreateTicketUseCaseInput,
  CreateTicketUseCaseOutput
> {
  private readonly logger = new Logger(CreateTicketUseCase.name);

  constructor(
    @Inject(TicketRepositoryToken)
    private readonly repository: ITicketRepository,
    @Inject(EventRepositoryToken)
    private readonly eventRepository: IEventRepository,
  ) {}

  async run(
    input: CreateTicketUseCaseInput,
  ): Promise<CreateTicketUseCaseOutput> {
    this.logger.log('Creating ticket', input.name);

    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new NotFoundException(`Evento ${input.eventId} não encontrado`);
    }

    if (event.maxAttendees != null) {
      const existingTickets = await this.repository.findByEventId(
        input.eventId,
      );
      const alreadyReserved = existingTickets.reduce(
        (sum, t) => sum + t.quantityAvailable,
        0,
      );
      if (alreadyReserved + input.quantityAvailable > event.maxAttendees) {
        throw new ConflictException(
          `A quantidade deste lote (${input.quantityAvailable}) somada aos lotes já criados (${alreadyReserved}) ultrapassa a capacidade máxima do evento (${event.maxAttendees}).`,
        );
      }
    }

    const saleStartDate = input.saleStartDate
      ? new Date(input.saleStartDate)
      : undefined;
    const saleEndDate = input.saleEndDate
      ? new Date(input.saleEndDate)
      : undefined;
    const eventStart = new Date(event.eventDate);
    const eventEnd = event.eventEndDate ? new Date(event.eventEndDate) : eventStart;

    if (saleStartDate && saleStartDate < eventStart) {
      throw new ConflictException(
        'A data de início das vendas não pode ser anterior à data de início do evento.',
      );
    }
    if (saleEndDate && saleEndDate > eventEnd) {
      throw new ConflictException(
        'A data de fim das vendas não pode ser posterior à data de término do evento.',
      );
    }

    const createData = {
      ...input,
      saleStartDate,
      saleEndDate,
    };
    return this.repository.create(createData);
  }
}
