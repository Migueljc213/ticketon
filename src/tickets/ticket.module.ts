import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Ticket from './domain/entity/Ticket.entity';
import TicketRepository from './external/repository/ticket.repository';
import {
  CreateTicketToken,
  DeleteTicketToken,
  FindAllTicketsToken,
  FindTicketByIdToken,
  FindTicketsByEventIdToken,
  TicketRepositoryToken,
  UpdateTicketToken,
} from './ticket.token';
import TicketController from './ticket.controller';
import CreateTicketUseCase from './usecase/create.ticket.usecase';
import FindTicketByIdUseCase from './usecase/find.ticket.by.id.usecase';
import FindAllTicketsUseCase from './usecase/find.all.tickets.usecase';
import FindTicketsByEventIdUseCase from './usecase/find.tickets.by.event.id.usecase';
import UpdateTicketUseCase from './usecase/update.ticket.usecase';
import DeleteTicketUseCase from './usecase/delete.ticket.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [TicketController],
  providers: [
    {
      provide: TicketRepositoryToken,
      useClass: TicketRepository,
    },
    {
      provide: CreateTicketToken,
      useClass: CreateTicketUseCase,
    },
    {
      provide: FindTicketByIdToken,
      useClass: FindTicketByIdUseCase,
    },
    {
      provide: FindAllTicketsToken,
      useClass: FindAllTicketsUseCase,
    },
    {
      provide: FindTicketsByEventIdToken,
      useClass: FindTicketsByEventIdUseCase,
    },
    {
      provide: UpdateTicketToken,
      useClass: UpdateTicketUseCase,
    },
    {
      provide: DeleteTicketToken,
      useClass: DeleteTicketUseCase,
    },
  ],
})
export default class TicketModule {}
