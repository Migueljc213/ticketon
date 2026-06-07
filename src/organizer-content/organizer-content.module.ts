import { Module } from '@nestjs/common';
import OrganizerContentController from './organizer-content.controller';

@Module({
  controllers: [OrganizerContentController],
})
export default class OrganizerContentModule {}
