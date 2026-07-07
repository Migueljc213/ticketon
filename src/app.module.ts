import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import UploadModule from './upload/upload.module';
import EventFeedbackModule from './event-feedbacks/event-feedback.module';
import EventFeedback from './event-feedbacks/domain/entity/EventFeedback.entity';
import AnalyticsModule from './analytics/analytics.module';
import OrganizerContentModule from './organizer-content/organizer-content.module';
import EventCollaboratorModule from './event-collaborators/event-collaborator.module';
import { MailerModule } from './mailer/mailer.module';
import NotificationsModule from './notifications/notifications.module';
import EventConsumptionRecordModule from './event-consumption-records/event-consumption-record.module';
import EventConsumptionRecord from './event-consumption-records/domain/entity/EventConsumptionRecord.entity';
import BankAccountModule from './bank-accounts/bank-account.module';
import BankAccount from './bank-accounts/domain/entity/BankAccount.entity';
import MetricsModule from './common/metrics/metrics.module';
import OrganizerStoreModule from './organizer-store/organizer-store.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 60,
      },
    ]),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      retryAttempts: 30,
      retryDelay: 5000,
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
      EventFeedback,
      EventConsumptionRecord,
      BankAccount,
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
    UploadModule,
    EventFeedbackModule,
    AnalyticsModule,
    OrganizerContentModule,
    EventCollaboratorModule,
    MailerModule,
    NotificationsModule,
    OrganizerStoreModule,
    EventConsumptionRecordModule,
    BankAccountModule,
    MetricsModule,
  ],
  providers: [
    SeedService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
