import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import EventConsumptionRecord from './domain/entity/EventConsumptionRecord.entity';
import EventConsumptionRecordController from './event-consumption-record.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventConsumptionRecord])],
  controllers: [EventConsumptionRecordController],
  exports: [TypeOrmModule],
})
export default class EventConsumptionRecordModule {}
