import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Event from './domain/entity/Event.entity';
import EventPost from './domain/entity/EventPost.entity';
import EventRepository from './external/repository/event.repository';
import {
  CreateEventToken,
  DeleteEventToken,
  EventRepositoryToken,
  EventPostRepositoryToken,
  FindAllEventsToken,
  FindEventByIdToken,
  SearchEventsToken,
  UpdateEventToken,
  CreateEventPostToken,
  FindEventPostsByEventIdToken,
} from './event.token';
import EventController from './event.controller';
import EventPostRepository from './external/repository/event-post.repository';
import CreateEventUseCase from './usecase/create.event.usecase';
import FindEventByIdUseCase from './usecase/find.event.by.id.usecase';
import FindAllEventsUseCase from './usecase/find.all.events.usecase';
import SearchEventsUseCase from './usecase/search.events.usecase';
import UpdateEventUseCase from './usecase/update.event.usecase';
import DeleteEventUseCase from './usecase/delete.event.usecase';
import CreateEventPostUseCase from './usecase/create.event.post.usecase';
import FindEventPostsByEventIdUseCase from './usecase/find.event.posts.by.event.id.usecase';
import OrderModule from 'src/orders/order.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventPost]), OrderModule],
  controllers: [EventController],
  providers: [
    {
      provide: EventRepositoryToken,
      useClass: EventRepository,
    },
    {
      provide: EventPostRepositoryToken,
      useClass: EventPostRepository,
    },
    {
      provide: CreateEventToken,
      useClass: CreateEventUseCase,
    },
    {
      provide: FindEventByIdToken,
      useClass: FindEventByIdUseCase,
    },
    {
      provide: FindAllEventsToken,
      useClass: FindAllEventsUseCase,
    },
    {
      provide: SearchEventsToken,
      useClass: SearchEventsUseCase,
    },
    {
      provide: UpdateEventToken,
      useClass: UpdateEventUseCase,
    },
    {
      provide: DeleteEventToken,
      useClass: DeleteEventUseCase,
    },
    {
      provide: CreateEventPostToken,
      useClass: CreateEventPostUseCase,
    },
    {
      provide: FindEventPostsByEventIdToken,
      useClass: FindEventPostsByEventIdUseCase,
    },
  ],
})
export default class EventModule {}
