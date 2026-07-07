import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Order from './domain/entity/Order.entity';
import OrderItem from './domain/entity/OrderItem.entity';
import OrderRepository from './external/repository/order.repository';
import OrderItemRepository from './external/repository/order-item.repository';
import CreateOrderUseCase from './usecase/create.order.usecase';
import FindOrderByIdUseCase from './usecase/find.order.by.id.usecase';
import FindOrdersByUserUseCase from './usecase/find.orders.by.user.usecase';
import ReleaseExpiredOrdersService from './usecase/release-expired-orders.service';
import GetParticipantsListUseCase from './usecase/get.participants.list.usecase';
import OrderController from './order.controller';
import {
  CreateOrderToken,
  FindOrderByIdToken,
  FindOrdersByUserToken,
  GetParticipantsListToken,
  OrderItemRepositoryToken,
  OrderRepositoryToken,
} from './order.token';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import TicketRepository from 'src/tickets/external/repository/ticket.repository';
import { TicketRepositoryToken } from 'src/tickets/ticket.token';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import PaymentModule from 'src/payments/payment.module';
import BusinessMetricsModule from 'src/common/metrics/business-metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Ticket, PurchasedTicket]),
    PaymentModule,
    BusinessMetricsModule,
  ],
  controllers: [OrderController],
  providers: [
    { provide: OrderRepositoryToken, useClass: OrderRepository },
    { provide: OrderItemRepositoryToken, useClass: OrderItemRepository },
    { provide: TicketRepositoryToken, useClass: TicketRepository },
    { provide: CreateOrderToken, useClass: CreateOrderUseCase },
    { provide: FindOrderByIdToken, useClass: FindOrderByIdUseCase },
    { provide: FindOrdersByUserToken, useClass: FindOrdersByUserUseCase },
    { provide: GetParticipantsListToken, useClass: GetParticipantsListUseCase },
    ReleaseExpiredOrdersService,
  ],
  exports: [OrderRepositoryToken],
})
export default class OrderModule {}
