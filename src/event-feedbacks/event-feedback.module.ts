import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import EventFeedback from './domain/entity/EventFeedback.entity';
import EventFeedbackRepository from './external/repository/event-feedback.repository';
import EventFeedbackController from './event-feedback.controller';
import { EventFeedbackRepositoryToken } from './event-feedback.token';

@Module({
  imports: [TypeOrmModule.forFeature([EventFeedback])],
  controllers: [EventFeedbackController],
  providers: [
    {
      provide: EventFeedbackRepositoryToken,
      useClass: EventFeedbackRepository,
    },
  ],
})
export default class EventFeedbackModule {}
