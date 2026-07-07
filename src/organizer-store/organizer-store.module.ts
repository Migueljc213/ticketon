import { Module } from '@nestjs/common';
import OrganizerStoreController from './organizer-store.controller';

@Module({
  controllers: [OrganizerStoreController],
})
export default class OrganizerStoreModule {}
