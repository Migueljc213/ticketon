import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Order from './domain/entity/Order.entity';
import OrderItem from './domain/entity/OrderItem.entity';
import OrderRepository from './external/repository/order.repository';
import CreateOrderUseCase from './usecase/create.order.usecase';
import FindOrderByIdUseCase from './usecase/find.order.by.id.usecase';
import FindOrdersByUserUseCase from './usecase/find.orders.by.user.usecase';
import OrderController from './order.controller';
import {
  CreateOrderToken,
  FindOrderByIdToken,
  FindOrdersByUserToken,
  OrderRepositoryToken,
} from './order.token';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import PaymentModule from 'src/payments/payment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Ticket, PurchasedTicket]), PaymentModule],
  controllers: [OrderController],
  providers: [
    { provide: OrderRepositoryToken, useClass: OrderRepository },
    { provide: CreateOrderToken, useClass: CreateOrderUseCase },
    { provide: FindOrderByIdToken, useClass: FindOrderByIdUseCase },
    { provide: FindOrdersByUserToken, useClass: FindOrdersByUserUseCase },
  ],
  exports: [OrderRepositoryToken],
})
export default class OrderModule {}
