import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment as MpPayment } from 'mercadopago';
import IUsecase from 'src/common/interfaces/IUseCase';
import Order from 'src/orders/domain/entity/Order.entity';
import { OrderStatus } from 'src/orders/domain/order-status.enum';
import PaymentEntity from '../domain/entity/Payment.entity';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';

export interface WebhookInput {
  type: string;
  data: { id: string };
}

export interface WebhookOutput {
  processed: boolean;
}

@Injectable()
export default class HandleWebhookUseCase
  implements IUsecase<WebhookInput, WebhookOutput>
{
  private readonly logger = new Logger(HandleWebhookUseCase.name);
  private readonly mpPaymentClient: MpPayment;

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {
    const accessToken = this.config.get<string>('MP_ACCESS_TOKEN') ?? '';
    const mpConfig = new MercadoPagoConfig({ accessToken });
    this.mpPaymentClient = new MpPayment(mpConfig);
  }

  async run(input: WebhookInput): Promise<WebhookOutput> {
    if (input.type !== 'payment') return { processed: false };

    this.logger.log(`Processing webhook for MP payment ID: ${input.data.id}`);

    // Busca detalhes do pagamento no Mercado Pago
    const mpPayment = await this.mpPaymentClient.get({ id: input.data.id });

    const orderId = Number(mpPayment.external_reference);
    const mpStatus = mpPayment.status; // approved | pending | rejected | etc.
    const paymentMethod = mpPayment.payment_type_id ?? null;

    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['items'],
      });

      if (!order) {
        this.logger.warn(`Order ${orderId} not found for webhook`);
        return { processed: false };
      }

      // Registra o pagamento
      await manager.save(
        manager.create(PaymentEntity, {
          orderId,
          mpPaymentId: String(mpPayment.id),
          status: mpStatus === 'approved' ? 'approved' : mpStatus === 'pending' ? 'pending' : 'rejected',
          paymentMethod,
          amount: Number(mpPayment.transaction_amount ?? 0),
          rawResponse: mpPayment as unknown as object,
        }),
      );

      if (mpStatus === 'approved') {
        // Confirma o pedido
        await manager.update(Order, orderId, {
          status: OrderStatus.PAID,
          mpPaymentId: String(mpPayment.id),
        });

        // Gera um ingresso (PurchasedTicket) por unidade comprada
        for (const item of order.items) {
          for (let i = 0; i < item.quantity; i++) {
            await manager.save(
              manager.create(PurchasedTicket, {
                orderId,
                ticketId: item.ticketId,
                userId: order.userId,
                qrCode: uuidv4(),
                status: 'valid',
                usedAt: null,
              }),
            );
          }
        }

        this.logger.log(`Order ${orderId} confirmed — ${order.items.reduce((s, i) => s + i.quantity, 0)} tickets issued`);
      } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
        // Cancela o pedido e devolve o estoque
        await manager.update(Order, orderId, { status: OrderStatus.CANCELLED });

        for (const item of order.items) {
          await manager.decrement(
            { type: 'tickets' } as any,
            { id: item.ticketId },
            'quantity_sold',
            item.quantity,
          );
        }
      }

      return { processed: true };
    });
  }
}
