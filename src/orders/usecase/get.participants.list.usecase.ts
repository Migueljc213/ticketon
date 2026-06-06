import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrderRepository from '../domain/interface/order.repository.interface';
import type IOrderItemRepository from '../domain/interface/order-item.repository.interface';
import type ITicketRepository from 'src/tickets/domain/interface/ticket.repository.interface';
import { OrderRepositoryToken, OrderItemRepositoryToken } from '../order.token';
import { TicketRepositoryToken } from 'src/tickets/ticket.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import GetParticipantsListUseCaseInput from './dto/input/get.participants.list.usecase.input';
import GetParticipantsListUseCaseOutput, {
  Participant,
} from './dto/output/get.participants.list.usecase.output';
import { OrderStatus } from '../domain/order-status.enum';

@Injectable()
export default class GetParticipantsListUseCase
  implements
    IUsecase<GetParticipantsListUseCaseInput, GetParticipantsListUseCaseOutput>
{
  private readonly logger = new Logger(GetParticipantsListUseCase.name);

  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @Inject(OrderItemRepositoryToken)
    private readonly orderItemRepository: IOrderItemRepository,
    @Inject(TicketRepositoryToken)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async run(
    input: GetParticipantsListUseCaseInput,
  ): Promise<GetParticipantsListUseCaseOutput> {
    this.logger.log('Getting participants list for event', input.eventId);

    const orders = await this.orderRepository.findByEventId(input.eventId);
    const paidOrders = orders.filter(
      (order) => order.status === OrderStatus.PAID,
    );

    const participants: Participant[] = [];

    for (const order of paidOrders) {
      const items = await this.orderItemRepository.findByOrderId(order.id);

      for (const item of items) {
        const ticket = await this.ticketRepository.findById(item.ticketId);
        if (!ticket) continue;

        participants.push(
          new Participant({
            orderId: order.id,
            orderItemId: item.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            ticketName: ticket.name,
            ticketPrice: Number(item.unitPrice),
            qrCode: item.qrCode || '',
            isCheckedIn: item.isUsed,
            checkedInAt: item.usedAt,
            purchasedAt: order.createdAt,
          }),
        );
      }
    }

    return new GetParticipantsListUseCaseOutput(participants);
  }
}
