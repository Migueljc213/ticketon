import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import IUsecase from 'src/common/interfaces/IUseCase';
import CreateOrderUseCaseInput from './dto/input/create.order.usecase.input';
import CreateOrderUseCaseOutput from './dto/output/create.order.usecase.output';
import Order from '../domain/entity/Order.entity';
import OrderItem from '../domain/entity/OrderItem.entity';
import { OrderStatus } from '../domain/order-status.enum';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import MercadoPagoService from 'src/payments/external/mercadopago.service';

@Injectable()
export default class CreateOrderUseCase
  implements IUsecase<CreateOrderUseCaseInput, CreateOrderUseCaseOutput>
{
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async run(input: CreateOrderUseCaseInput): Promise<CreateOrderUseCaseOutput> {
    this.logger.log(`Creating order for user ${input.userId}`);

    return this.dataSource.transaction(async (manager) => {
      // Pessimistic write lock: garante que nenhuma outra transação
      // leia/atualize os mesmos ingressos ao mesmo tempo
      const ticketIds = input.items.map((i) => i.ticketId);
      const tickets = await manager
        .createQueryBuilder(Ticket, 't')
        .setLock('pessimistic_write')
        .whereInIds(ticketIds)
        .getMany();

      if (tickets.length !== ticketIds.length) {
        throw new NotFoundException('Um ou mais tipos de ingresso não foram encontrados');
      }

      // Valida disponibilidade de estoque
      for (const item of input.items) {
        const ticket = tickets.find((t) => t.id === item.ticketId)!;
        const available = ticket.quantityAvailable - ticket.quantitySold;
        if (available < item.quantity) {
          throw new ConflictException(
            `Ingresso "${ticket.name}" não tem estoque suficiente (disponível: ${available})`,
          );
        }
        if (item.quantity < ticket.minPerOrder || item.quantity > ticket.maxPerOrder) {
          throw new ConflictException(
            `Quantidade inválida para "${ticket.name}" (min: ${ticket.minPerOrder}, max: ${ticket.maxPerOrder})`,
          );
        }
      }

      // Calcula total
      const totalAmount = input.items.reduce((sum, item) => {
        const ticket = tickets.find((t) => t.id === item.ticketId)!;
        return sum + Number(ticket.price) * item.quantity;
      }, 0);

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Cria o pedido
      const order = manager.create(Order, {
        userId: input.userId,
        status: OrderStatus.PENDING,
        totalAmount,
        expiresAt,
        mpPreferenceId: null,
        mpPaymentId: null,
      });
      await manager.save(order);

      // Cria os itens e reserva os ingressos atomicamente
      for (const item of input.items) {
        const ticket = tickets.find((t) => t.id === item.ticketId)!;

        await manager.save(
          manager.create(OrderItem, {
            orderId: order.id,
            ticketId: item.ticketId,
            quantity: item.quantity,
            unitPrice: Number(ticket.price),
          }),
        );

        // Incrementa quantitySold para reservar o estoque
        await manager.update(Ticket, ticket.id, {
          quantitySold: ticket.quantitySold + item.quantity,
        });
      }

      // Cria a preferência no Mercado Pago
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

      // Salva o ID da preferência no pedido
      await manager.update(Order, order.id, {
        mpPreferenceId: preference.id,
      });

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
