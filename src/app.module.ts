import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([User, Organizer, Event, Ticket]),
    UserModule,
    AuthModule,
    OrganizerModule,
    EventModule,
    TicketModule,
  ],
  providers: [],
})
export class AppModule {}
