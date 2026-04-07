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
import FindOrderItemByQrCodeUseCaseInput from './dto/input/find.order.item.by.qr.code.usecase.input';
import FindOrderItemByQrCodeUseCaseOutput from './dto/output/find.order.item.by.qr.code.usecase.output';

@Injectable()
export default class FindOrderItemByQrCodeUseCase
  implements
    IUsecase<
      FindOrderItemByQrCodeUseCaseInput,
      FindOrderItemByQrCodeUseCaseOutput
    >
{
  private readonly logger = new Logger(FindOrderItemByQrCodeUseCase.name);

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
    input: FindOrderItemByQrCodeUseCaseInput,
  ): Promise<FindOrderItemByQrCodeUseCaseOutput> {
    this.logger.log('Finding order item by QR code', input.qrCode);

    const orderItem = await this.orderItemRepository.findByQrCode(
      input.qrCode,
    );

    if (!orderItem) {
      throw new Error('QR Code não encontrado');
    }

    const order = await this.orderRepository.findById(orderItem.orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    const event = await this.eventRepository.findById(order.eventId);
    if (!event) {
      throw new Error('Evento não encontrado');
    }

    const ticket = await this.ticketRepository.findById(orderItem.ticketId);
    if (!ticket) {
      throw new Error('Ingresso não encontrado');
    }

    return new FindOrderItemByQrCodeUseCaseOutput(orderItem, order, event, ticket);
  }
}

