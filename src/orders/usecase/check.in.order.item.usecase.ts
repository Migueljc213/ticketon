import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrderItemRepository from '../domain/interface/order-item.repository.interface';
import type IOrderRepository from '../domain/interface/order.repository.interface';
import type IEventRepository from 'src/events/domain/interface/event.repository.interface';
import type ITicketRepository from 'src/tickets/domain/interface/ticket.repository.interface';
import {
  OrderItemRepositoryToken,
  OrderRepositoryToken,
} from '../order.token';
import { EventRepositoryToken } from 'src/events/event.token';
import { TicketRepositoryToken } from 'src/tickets/ticket.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import CheckInOrderItemUseCaseInput from './dto/input/check.in.order.item.usecase.input';
import CheckInOrderItemUseCaseOutput from './dto/output/check.in.order.item.usecase.output';
import { OrderStatus } from '../domain/order-status.enum';

@Injectable()
export default class CheckInOrderItemUseCase
  implements
    IUsecase<CheckInOrderItemUseCaseInput, CheckInOrderItemUseCaseOutput>
{
  private readonly logger = new Logger(CheckInOrderItemUseCase.name);

  constructor(
    @Inject(OrderItemRepositoryToken)
    private readonly orderItemRepository: IOrderItemRepository,
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @Inject(EventRepositoryToken)
    private readonly eventRepository: IEventRepository,
    @Inject(TicketRepositoryToken)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async run(
    input: CheckInOrderItemUseCaseInput,
  ): Promise<CheckInOrderItemUseCaseOutput> {
    this.logger.log('Checking in order item with QR code', input.qrCode);

    const orderItem = await this.orderItemRepository.findByQrCode(
      input.qrCode,
    );

    if (!orderItem) {
      return new CheckInOrderItemUseCaseOutput(
        null as any,
        null as any,
        null as any,
        null as any,
        false,
        'QR Code não encontrado',
      );
    }

    if (orderItem.isUsed) {
      const order = await this.orderRepository.findById(orderItem.orderId);
      const event = order
        ? await this.eventRepository.findById(order.eventId)
        : null;
      const ticket = await this.ticketRepository.findById(orderItem.ticketId);

      return new CheckInOrderItemUseCaseOutput(
        orderItem,
        order!,
        event!,
        ticket!,
        false,
        'Ingresso já foi utilizado',
      );
    }

    const order = await this.orderRepository.findById(orderItem.orderId);
    if (!order) {
      return new CheckInOrderItemUseCaseOutput(
        orderItem,
        null as any,
        null as any,
        null as any,
        false,
        'Pedido não encontrado',
      );
    }

    const event = await this.eventRepository.findById(order.eventId);
    if (!event) {
      return new CheckInOrderItemUseCaseOutput(
        orderItem,
        order,
        null as any,
        null as any,
        false,
        'Evento não encontrado',
      );
    }

    const ticket = await this.ticketRepository.findById(orderItem.ticketId);
    if (!ticket) {
      return new CheckInOrderItemUseCaseOutput(
        orderItem,
        order,
        event,
        null as any,
        false,
        'Ingresso não encontrado',
      );
    }

    const now = new Date();
    if (new Date(event.eventDate) > now) {
      return new CheckInOrderItemUseCaseOutput(
        orderItem,
        order,
        event,
        ticket,
        false,
        'Evento ainda não começou',
      );
    }

    if (order.status !== OrderStatus.PAID) {
      return new CheckInOrderItemUseCaseOutput(
        orderItem,
        order,
        event,
        ticket,
        false,
        'Pedido não está pago',
      );
    }

    await this.orderItemRepository.update(orderItem.id, {
      isUsed: true,
      usedAt: new Date(),
      checkedInBy: input.checkedInBy != null ? String(input.checkedInBy) : null,
    });

    const updatedItem = await this.orderItemRepository.findById(orderItem.id);

    this.logger.log('Order item checked in successfully', orderItem.id);

    return new CheckInOrderItemUseCaseOutput(
      updatedItem!,
      order,
      event,
      ticket,
      true,
      'Check-in realizado com sucesso',
    );
  }
}

