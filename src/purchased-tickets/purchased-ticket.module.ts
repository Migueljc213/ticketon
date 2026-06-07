import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PurchasedTicket from './domain/entity/PurchasedTicket.entity';
import PurchasedTicketRepository from './external/repository/purchased-ticket.repository';
import PurchasedTicketController from './purchased-ticket.controller';
import { PurchasedTicketRepositoryToken } from './purchased-ticket.token';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import Event from 'src/events/domain/entity/Event.entity';
import User from 'src/users/domain/entity/User.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchasedTicket, Ticket, Event, User])],
  controllers: [PurchasedTicketController],
  providers: [
    {
      provide: PurchasedTicketRepositoryToken,
      useClass: PurchasedTicketRepository,
    },
  ],
  exports: [PurchasedTicketRepositoryToken],
})
export default class PurchasedTicketModule {}
