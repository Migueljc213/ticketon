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

const BYPASS_PAYMENT = true;
const PLATFORM_FEE_RATE = 0.07;
const ORDER_EXPIRY_MS = 15 * 60 * 1000;

@Injectable()
export default class CreateOrderUseCase implements IUsecase<
  CreateOrderUseCaseInput,
  CreateOrderUseCaseOutput
> {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

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
          throw new ConflictException(`O ingresso "${ticket.name}" está esgotado.`);
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

      const subtotalAmount = input.items.reduce((sum, item) => {
        const ticket = tickets.find((t) => t.id === item.ticketId)!;
        return sum + Number(ticket.price) * item.quantity;
      }, 0);
      const platformFee = Math.round(subtotalAmount * PLATFORM_FEE_RATE * 100) / 100;
      const totalAmount = subtotalAmount + platformFee;
      const expiresAt = new Date(Date.now() + ORDER_EXPIRY_MS);
      const eventId = tickets[0].eventId;

      const order = manager.create(Order, {
        userId: input.userId,
        eventId,
        status: OrderStatus.PENDING,
        subtotalAmount,
        platformFee,
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

      if (BYPASS_PAYMENT) {
        this.logger.warn(`[BYPASS_PAYMENT] Confirmando pedido ${order.id} automaticamente`);
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

        this.logger.log(`[BYPASS_PAYMENT] ${ticketCount} ingresso(s) emitidos para pedido ${order.id}`);

        return new CreateOrderUseCaseOutput({
          orderId: order.id,
          initPoint: '',
          sandboxInitPoint: '',
          subtotalAmount,
          platformFee,
          totalAmount,
          expiresAt,
          ticketCount,
          bypass: true,
        });
      }

      return new CreateOrderUseCaseOutput({
        orderId: order.id,
        initPoint: '',
        sandboxInitPoint: '',
        subtotalAmount,
        platformFee,
        totalAmount,
        expiresAt,
      });
    });
  }
}
