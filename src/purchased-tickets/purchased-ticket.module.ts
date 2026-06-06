import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PurchasedTicket from './domain/entity/PurchasedTicket.entity';
import PurchasedTicketRepository from './external/repository/purchased-ticket.repository';
import PurchasedTicketController from './purchased-ticket.controller';
import { PurchasedTicketRepositoryToken } from './purchased-ticket.token';

@Module({
  imports: [TypeOrmModule.forFeature([PurchasedTicket])],
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
