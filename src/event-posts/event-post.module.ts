import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import EventPost from './domain/entity/EventPost.entity';
import EventPostRepository from './external/repository/event-post.repository';
import EventPostController from './event-post.controller';
import { EventPostRepositoryToken } from './event-post.token';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventPost, PurchasedTicket, Ticket])],
  controllers: [EventPostController],
  providers: [
    { provide: EventPostRepositoryToken, useClass: EventPostRepository },
  ],
})
export default class EventPostModule {}
