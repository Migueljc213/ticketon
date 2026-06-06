import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PaymentEntity from './domain/entity/Payment.entity';
import MercadoPagoService from './external/mercadopago.service';
import HandleWebhookUseCase from './usecase/handle.webhook.usecase';
import PaymentController from './payment.controller';
import { HandleWebhookToken } from './payment.token';
import Order from 'src/orders/domain/entity/Order.entity';
import OrderItem from 'src/orders/domain/entity/OrderItem.entity';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, Order, OrderItem, PurchasedTicket])],
  controllers: [PaymentController],
  providers: [
    MercadoPagoService,
    { provide: HandleWebhookToken, useClass: HandleWebhookUseCase },
  ],
  exports: [MercadoPagoService],
})
export default class PaymentModule {}
