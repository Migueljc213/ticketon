import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Order from './domain/entity/Order.entity';
import OrderItem from './domain/entity/OrderItem.entity';
import OrderRepository from './external/repository/order.repository';
import OrderItemRepository from './external/repository/order-item.repository';
import {
  OrderRepositoryToken,
  OrderItemRepositoryToken,
  CreateOrderToken,
  FindOrdersByUserIdToken,
  FindOrderItemByQrCodeToken,
  CheckInOrderItemToken,
  GetCheckInDashboardToken,
  GetParticipantsListToken,
  GetPlatformRevenueToken,
} from './order.token';
import OrderController from './order.controller';
import CreateOrderUseCase from './usecase/create.order.usecase';
import FindOrdersByUserIdUseCase from './usecase/find.orders.by.user.id.usecase';
import FindOrderItemByQrCodeUseCase from './usecase/find.order.item.by.qr.code.usecase';
import CheckInOrderItemUseCase from './usecase/check.in.order.item.usecase';
import GetCheckInDashboardUseCase from './usecase/get.checkin.dashboard.usecase';
import GetParticipantsListUseCase from './usecase/get.participants.list.usecase';
import GetPlatformRevenueUseCase from './usecase/get.platform.revenue.usecase';
import { TicketRepositoryToken } from 'src/tickets/ticket.token';
import TicketRepository from 'src/tickets/external/repository/ticket.repository';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import { EventRepositoryToken } from 'src/events/event.token';
import EventRepository from 'src/events/external/repository/event.repository';
import Event from 'src/events/domain/entity/Event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Ticket, Event]),
  ],
  controllers: [OrderController],
  providers: [
    {
      provide: OrderRepositoryToken,
      useClass: OrderRepository,
    },
    {
      provide: OrderItemRepositoryToken,
      useClass: OrderItemRepository,
    },
    {
      provide: TicketRepositoryToken,
      useClass: TicketRepository,
    },
    {
      provide: EventRepositoryToken,
      useClass: EventRepository,
    },
    {
      provide: CreateOrderToken,
      useClass: CreateOrderUseCase,
    },
    {
      provide: FindOrdersByUserIdToken,
      useClass: FindOrdersByUserIdUseCase,
    },
    {
      provide: FindOrderItemByQrCodeToken,
      useClass: FindOrderItemByQrCodeUseCase,
    },
    {
      provide: CheckInOrderItemToken,
      useClass: CheckInOrderItemUseCase,
    },
    {
      provide: GetCheckInDashboardToken,
      useClass: GetCheckInDashboardUseCase,
    },
    {
      provide: GetParticipantsListToken,
      useClass: GetParticipantsListUseCase,
    },
    {
      provide: GetPlatformRevenueToken,
      useClass: GetPlatformRevenueUseCase,
    },
  ],
  exports: [OrderRepositoryToken, OrderItemRepositoryToken],
})
export default class OrderModule {}

