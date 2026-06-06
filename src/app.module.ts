import { Module } from '@nestjs/common';
import AppController from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './common/seed/seed.service';
import { dataSourceOptions } from './data-source';
import { ConfigModule } from '@nestjs/config';
import UserModule from './users/user.module';
import User from './users/domain/entity/User.entity';
import AuthModule from './auth/auth.module';
import OrganizerModule from './organizers/organizer.module';
import Organizer from './organizers/domain/entity/Organizer.entity';
import EventModule from './events/event.module';
import Event from './events/domain/entity/Event.entity';
import TicketModule from './tickets/ticket.module';
import Ticket from './tickets/domain/entity/Ticket.entity';
import OrderModule from './orders/order.module';
import Order from './orders/domain/entity/Order.entity';
import OrderItem from './orders/domain/entity/OrderItem.entity';
import PaymentModule from './payments/payment.module';
import PaymentEntity from './payments/domain/entity/Payment.entity';
import PurchasedTicketModule from './purchased-tickets/purchased-ticket.module';
import PurchasedTicket from './purchased-tickets/domain/entity/PurchasedTicket.entity';
import EventPostModule from './event-posts/event-post.module';
import EventPost from './event-posts/domain/entity/EventPost.entity';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    TypeOrmModule.forFeature([
      User,
      Organizer,
      Event,
      Ticket,
      Order,
      OrderItem,
      PaymentEntity,
      PurchasedTicket,
      EventPost,
    ]),
    UserModule,
    AuthModule,
    OrganizerModule,
    EventModule,
    TicketModule,
    OrderModule,
    PaymentModule,
    PurchasedTicketModule,
    EventPostModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
