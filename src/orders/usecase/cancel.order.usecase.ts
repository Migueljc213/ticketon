import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import IUsecase from 'src/common/interfaces/IUseCase';
import Order from '../domain/entity/Order.entity';
import { OrderStatus } from '../domain/order-status.enum';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import {
  calculateRefundEligibility,
  RefundEligibility,
} from '../domain/refund-policy';

export interface CancelOrderInput {
  orderId: number;
  requestingUserId: number;
}

export interface CancelOrderOutput {
  orderId: number;
  status: string;
  refundAmount: number;
  reason: string;
}

@Injectable()
export default class CancelOrderUseCase
  implements IUsecase<CancelOrderInput, CancelOrderOutput>
{
  private readonly logger = new Logger(CancelOrderUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(input: CancelOrderInput): Promise<CancelOrderOutput> {
    this.logger.log(`Cancel request — order ${input.orderId} by user ${input.requestingUserId}`);

    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: input.orderId },
        relations: ['items'],
      });

      if (!order) {
        throw new NotFoundException(`Pedido ${input.orderId} não encontrado.`);
      }

      if (order.userId !== input.requestingUserId) {
        throw new ForbiddenException('Você não tem permissão para cancelar este pedido.');
      }

      if (order.status !== OrderStatus.PAID) {
        throw new BadRequestException(
          `Não é possível cancelar um pedido com status "${order.status}". Apenas pedidos pagos podem ser cancelados.`,
        );
      }

      // Busca data do evento para aplicar a política de reembolso
      const [eventRow] = await manager.query<Array<{ event_date: Date }>>(
        `SELECT event_date FROM events WHERE id = ? LIMIT 1`,
        [order.eventId],
      );

      if (!eventRow) {
        throw new NotFoundException('Evento associado ao pedido não encontrado.');
      }

      const eligibility: RefundEligibility = calculateRefundEligibility(
        Number(order.totalAmount),
        Number(order.subtotalAmount),
        order.createdAt,
        new Date(eventRow.event_date),
      );

      this.logger.log(
        `Refund eligibility for order ${input.orderId}: eligible=${eligibility.eligible}, amount=${eligibility.refundAmount}`,
      );

      if (!eligibility.eligible) {
        throw new BadRequestException(eligibility.reason);
      }

      // Cancela os ingressos emitidos
      const purchasedTickets = await manager.find(PurchasedTicket, {
        where: { orderId: input.orderId },
      });

      for (const pt of purchasedTickets) {
        await manager.update(PurchasedTicket, pt.id, { status: 'cancelled' });
      }

      // Devolve estoque (decrementa quantitySold)
      for (const item of order.items) {
        await manager.decrement(
          Ticket,
          { id: item.ticketId },
          'quantitySold',
          item.quantity,
        );
      }

      // Atualiza status do pedido
      await manager.update(Order, input.orderId, {
        status: OrderStatus.REFUNDED,
      });

      this.logger.log(
        `Order ${input.orderId} cancelled. Refund: R$ ${eligibility.refundAmount}`,
      );

      // TODO: quando MP estiver ativo, chamar MercadoPagoService.refund() aqui
      // e registrar na tabela de payments com status 'refunded'

      return {
        orderId: input.orderId,
        status: OrderStatus.REFUNDED,
        refundAmount: eligibility.refundAmount,
        reason: eligibility.reason,
      };
    });
  }
}
