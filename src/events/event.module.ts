import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Event from './domain/entity/Event.entity';
import EventRepository from './external/repository/event.repository';
import {
  CreateEventToken,
  DeleteEventToken,
  EventRepositoryToken,
  FindAllEventsToken,
  FindEventByIdToken,
  UpdateEventToken,
} from './event.token';
import EventController from './event.controller';
import CreateEventUseCase from './usecase/create.event.usecase';
import FindEventByIdUseCase from './usecase/find.event.by.id.usecase';
import FindAllEventsUseCase from './usecase/find.all.events.usecase';
import UpdateEventUseCase from './usecase/update.event.usecase';
import DeleteEventUseCase from './usecase/delete.event.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [EventController],
  providers: [
    {
      provide: EventRepositoryToken,
      useClass: EventRepository,
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
      provide: UpdateEventToken,
      useClass: UpdateEventUseCase,
    },
    {
      provide: DeleteEventToken,
      useClass: DeleteEventUseCase,
    },
  ],
})
export default class EventModule {}
