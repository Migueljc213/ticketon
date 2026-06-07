import { Module } from '@nestjs/common';
import NotificationsController from './notifications.controller';

@Module({
  controllers: [NotificationsController],
})
export default class NotificationsModule {}
