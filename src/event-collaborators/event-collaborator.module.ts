import { Module } from '@nestjs/common';
import EventCollaboratorController from './event-collaborator.controller';

@Module({
  controllers: [EventCollaboratorController],
})
export default class EventCollaboratorModule {}
