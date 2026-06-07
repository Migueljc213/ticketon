import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, LessThan } from 'typeorm';
import Order from '../domain/entity/Order.entity';
import { OrderStatus } from '../domain/order-status.enum';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';

/**
 * Roda a cada 60 segundos e libera o estoque (quantitySold) de pedidos
 * que expiraram sem pagamento, evitando que ingressos fiquem "presos".
 *
 * Usa pessimistic_write por pedido para ser seguro em múltiplas instâncias.
 */
@Injectable()
export default class ReleaseExpiredOrdersService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ReleaseExpiredOrdersService.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit(): void {
    void this.releaseExpiredStock();
    this.intervalId = setInterval(() => void this.releaseExpiredStock(), 60_000);
    this.logger.log('Serviço de liberação de estoque iniciado (intervalo: 60s)');
  }

  onModuleDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  async releaseExpiredStock(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const expiredOrders = await this.dataSource.getRepository(Order).find({
        where: { status: OrderStatus.PENDING, expiresAt: LessThan(new Date()) },
        relations: ['items'],
      });

      if (expiredOrders.length === 0) return;

      this.logger.log(
        `Liberando estoque de ${expiredOrders.length} pedido(s) expirado(s)`,
      );

      for (const order of expiredOrders) {
        await this.processExpiredOrder(order);
      }
    } catch (err) {
      this.logger.error('Erro ao liberar estoque expirado', err);
    } finally {
      this.isRunning = false;
    }
  }

  private async processExpiredOrder(order: Order): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        // Re-lock: garante que outra instância não processe o mesmo pedido
        const locked = await manager
          .createQueryBuilder(Order, 'o')
          .setLock('pessimistic_write')
          .where('o.id = :id AND o.status = :status', {
            id: order.id,
            status: OrderStatus.PENDING,
          })
          .getOne();

        if (!locked) return; // Já processado por outra instância

        // GREATEST evita quantitySold negativo em caso de inconsistência
        for (const item of order.items) {
          await manager
            .createQueryBuilder()
            .update(Ticket)
            .set({
              quantitySold: () =>
                `GREATEST(quantity_sold - ${item.quantity}, 0)`,
            })
            .where('id = :id', { id: item.ticketId })
            .execute();
        }

        await manager.update(Order, order.id, { status: OrderStatus.EXPIRED });
        this.logger.debug(
          `Pedido #${order.id} expirado — ${order.items.length} lote(s) com estoque restaurado`,
        );
      });
    } catch (err) {
      this.logger.error(`Erro ao processar pedido #${order.id}`, err);
    }
  }
}
