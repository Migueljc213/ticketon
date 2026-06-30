import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import IUsecase from 'src/common/interfaces/IUseCase';
import CreateOrderUseCaseInput from './dto/input/create.order.usecase.input';
import CreateOrderUseCaseOutput from './dto/output/create.order.usecase.output';
import Order from '../domain/entity/Order.entity';
import OrderItem from '../domain/entity/OrderItem.entity';
import { OrderStatus } from '../domain/order-status.enum';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import MercadoPagoService from 'src/payments/external/mercadopago.service';

@Injectable()
export default class CreateOrderUseCase implements IUsecase<
  CreateOrderUseCaseInput,
  CreateOrderUseCaseOutput
> {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async run(input: CreateOrderUseCaseInput): Promise<CreateOrderUseCaseOutput> {
    this.logger.log(`Creating order for user ${input.userId}`);

    return this.dataSource.transaction(async (manager) => {
      const ticketIds = input.items.map((i) => i.ticketId);
      const tickets = await manager
        .createQueryBuilder(Ticket, 't')
        .setLock('pessimistic_write')
        .whereInIds(ticketIds)
        .getMany();

      const missingIds = ticketIds.filter(
        (id) => !tickets.find((t) => t.id === id),
      );
      if (missingIds.length > 0) {
        throw new NotFoundException(
          `Ingresso${missingIds.length > 1 ? 's' : ''} não encontrado${missingIds.length > 1 ? 's' : ''}: IDs ${missingIds.join(', ')}`,
        );
      }

      for (const item of input.items) {
        const ticket = tickets.find((t) => t.id === item.ticketId)!;
        const available = ticket.quantityAvailable - ticket.quantitySold;

        if (!ticket.isActive) {
          throw new ConflictException(
            `O ingresso "${ticket.name}" não está mais disponível para venda.`,
          );
        }
        if (available <= 0) {
          throw new ConflictException(
            `O ingresso "${ticket.name}" está esgotado.`,
          );
        }
        if (available < item.quantity) {
          throw new ConflictException(
            `O ingresso "${ticket.name}" tem apenas ${available} unidade${available > 1 ? 's' : ''} disponível${available > 1 ? 'eis' : ''}, mas você solicitou ${item.quantity}.`,
          );
        }
        if (item.quantity < ticket.minPerOrder) {
          throw new ConflictException(
            `O ingresso "${ticket.name}" exige mínimo de ${ticket.minPerOrder} unidade${ticket.minPerOrder > 1 ? 's' : ''} por pedido.`,
          );
        }
        if (item.quantity > ticket.maxPerOrder) {
          throw new ConflictException(
            `O ingresso "${ticket.name}" permite no máximo ${ticket.maxPerOrder} unidade${ticket.maxPerOrder > 1 ? 's' : ''} por pedido.`,
          );
        }
      }

      const totalAmount = input.items.reduce((sum, item) => {
        const ticket = tickets.find((t) => t.id === item.ticketId)!;
        return sum + Number(ticket.price) * item.quantity;
      }, 0);

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const eventId = tickets[0].eventId;

      const order = manager.create(Order, {
        userId: input.userId,
        eventId,
        status: OrderStatus.PENDING,
        totalAmount,
        expiresAt,
        mpPreferenceId: null,
        mpPaymentId: null,
        customerGender: input.customerGender ?? null,
        customerAge: input.customerAge ?? null,
        customerNeighborhood: input.customerNeighborhood ?? null,
      });
      await manager.save(order);

      for (const item of input.items) {
        const ticket = tickets.find((t) => t.id === item.ticketId)!;

        await manager.save(
          manager.create(OrderItem, {
            orderId: order.id,
            ticketId: item.ticketId,
            quantity: item.quantity,
            unitPrice: Number(ticket.price),
            totalPrice: Number(ticket.price) * item.quantity,
          }),
        );

        await manager.update(Ticket, ticket.id, {
          quantitySold: ticket.quantitySold + item.quantity,
        });
      }

      if (totalAmount === 0) {
        await manager.update(Order, order.id, { status: OrderStatus.PAID });

        let ticketCount = 0;
        for (const item of input.items) {
          const ticket = tickets.find((t) => t.id === item.ticketId)!;
          for (let i = 0; i < item.quantity; i++) {
            await manager.save(
              manager.create(PurchasedTicket, {
                orderId: order.id,
                ticketId: ticket.id,
                userId: input.userId,
                qrCode: uuidv4(),
                status: 'valid',
                usedAt: null,
              }),
            );
            ticketCount++;
          }
        }

        return new CreateOrderUseCaseOutput({
          orderId: order.id,
          initPoint: '',
          sandboxInitPoint: '',
          totalAmount,
          expiresAt,
          ticketCount,
          bypass: true,
        });
      }

      const preferenceItems = input.items.map((item) => {
        const ticket = tickets.find((t) => t.id === item.ticketId)!;
        return {
          id: String(ticket.id),
          title: ticket.name,
          quantity: item.quantity,
          unit_price: Number(ticket.price),
          currency_id: 'BRL',
        };
      });

      const preference = await this.mercadoPagoService.createPreference({
        items: preferenceItems,
        externalReference: String(order.id),
        backUrl: input.backUrl,
      });

      await manager.update(Order, order.id, { mpPreferenceId: preference.id });

      this.logger.log(`Order ${order.id} → MP preference ${preference.id}`);

      return new CreateOrderUseCaseOutput({
        orderId: order.id,
        initPoint: preference.initPoint,
        sandboxInitPoint: preference.sandboxInitPoint,
        totalAmount,
        expiresAt,
      });
    });
  }
}
