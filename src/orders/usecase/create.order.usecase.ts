import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrderRepository from '../domain/interface/order.repository.interface';
import type IOrderItemRepository from '../domain/interface/order-item.repository.interface';
import type ITicketRepository from 'src/tickets/domain/interface/ticket.repository.interface';
import { OrderRepositoryToken, OrderItemRepositoryToken } from '../order.token';
import { TicketRepositoryToken } from 'src/tickets/ticket.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import CreateOrderUseCaseInput from './dto/input/create.order.usecase.input';
import CreateOrderUseCaseOutput from './dto/output/create.order.usecase.output';
import { OrderStatus } from '../domain/order-status.enum';
import * as crypto from 'crypto';

@Injectable()
export default class CreateOrderUseCase
  implements IUsecase<CreateOrderUseCaseInput, CreateOrderUseCaseOutput>
{
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @Inject(OrderItemRepositoryToken)
    private readonly orderItemRepository: IOrderItemRepository,
    @Inject(TicketRepositoryToken)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async run(
    input: CreateOrderUseCaseInput,
  ): Promise<CreateOrderUseCaseOutput> {
    this.logger.log('Creating order for event', input.eventId);

    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of input.items) {
      const ticket = await this.ticketRepository.findById(item.ticketId);
      if (!ticket) {
        throw new Error(`Ticket ${item.ticketId} not found`);
      }

      if (ticket.eventId !== input.eventId) {
        throw new Error(`Ticket ${item.ticketId} does not belong to event ${input.eventId}`);
      }

      if (ticket.quantityAvailable < item.quantity) {
        throw new Error(`Insufficient tickets available for ticket ${item.ticketId}`);
      }

      if (!ticket.isActive) {
        throw new Error(`Ticket ${item.ticketId} is not active`);
      }

      const itemTotal = ticket.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        ticketId: item.ticketId,
        quantity: item.quantity,
        unitPrice: ticket.price,
        totalPrice: itemTotal,
        ticket,
      });
    }

    const order = await this.orderRepository.create({
      userId: input.userId,
      eventId: input.eventId,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentMethod: input.paymentMethod || 'pending',
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      notes: input.notes,
    });

    const createdItems: any[] = [];
    for (const item of orderItems) {
      for (let i = 0; i < item.quantity; i++) {
        const qrCodeData: any = {
          orderItemId: null,
          orderId: order.id,
          ticketId: item.ticketId,
          eventId: input.eventId,
          userId: input.userId,
          timestamp: new Date().toISOString(),
        };

        const qrCode = this.generateQrCode(qrCodeData);

        const orderItem = await this.orderItemRepository.create({
          orderId: order.id,
          ticketId: item.ticketId,
          quantity: 1,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice,
          qrCode,
          qrCodeData: JSON.stringify(qrCodeData),
          isUsed: false,
        });

        qrCodeData.orderItemId = orderItem.id;
        orderItem.qrCodeData = JSON.stringify(qrCodeData);
        await this.orderItemRepository.update(orderItem.id, {
          qrCodeData: orderItem.qrCodeData,
        });

        await this.ticketRepository.update(item.ticketId, {
          quantitySold: item.ticket.quantitySold + 1,
          quantityAvailable: item.ticket.quantityAvailable - 1,
        });

        createdItems.push(orderItem);
      }
    }

    await this.orderRepository.update(order.id, {
      status: OrderStatus.PAID,
      paymentMethod: input.paymentMethod || 'simulated',
    });

    const updatedOrder = await this.orderRepository.findById(order.id);
    if (!updatedOrder) {
      throw new Error('Order not found after creation');
    }

    this.logger.log('Order created successfully', order.id);

    return new CreateOrderUseCaseOutput(updatedOrder, createdItems);
  }

  private generateQrCode(data: any): string {
    const dataString = JSON.stringify(data);
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    return `TICKET-${hash.substring(0, 32).toUpperCase()}`;
  }
}

