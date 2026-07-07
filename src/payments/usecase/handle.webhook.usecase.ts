import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment as MpPayment } from 'mercadopago';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import IUsecase from 'src/common/interfaces/IUseCase';
import Order from 'src/orders/domain/entity/Order.entity';
import { OrderStatus } from 'src/orders/domain/order-status.enum';
import PaymentEntity from '../domain/entity/Payment.entity';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import { MailerService } from 'src/mailer/mailer.service';
import {
  CHECKOUT_TOTAL_METRIC,
  PAYMENTS_TOTAL_METRIC,
} from 'src/common/metrics/business-metrics.module';

export interface WebhookInput {
  type: string;
  data: { id: string };
}

export interface WebhookOutput {
  processed: boolean;
}

@Injectable()
export default class HandleWebhookUseCase implements IUsecase<
  WebhookInput,
  WebhookOutput
> {
  private readonly logger = new Logger(HandleWebhookUseCase.name);
  private readonly mpPaymentClient: MpPayment;

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly mailerService: MailerService,
    @InjectMetric(PAYMENTS_TOTAL_METRIC)
    private readonly paymentsTotal: Counter<string>,
    @InjectMetric(CHECKOUT_TOTAL_METRIC)
    private readonly checkoutTotal: Counter<string>,
  ) {
    const accessToken = this.config.get<string>('MP_ACCESS_TOKEN') ?? '';
    const mpConfig = new MercadoPagoConfig({ accessToken });
    this.mpPaymentClient = new MpPayment(mpConfig);
  }

  async run(input: WebhookInput): Promise<WebhookOutput> {
    if (input.type !== 'payment') return { processed: false };

    this.logger.log(`Processing webhook for MP payment ID: ${input.data.id}`);

    let mpPayment: Awaited<ReturnType<typeof this.mpPaymentClient.get>>;
    try {
      mpPayment = await this.mpPaymentClient.get({ id: input.data.id });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        this.logger.warn(`MP payment ${input.data.id} not found — ignoring webhook`);
        return { processed: false };
      }
      throw err;
    }

    const orderId = Number(mpPayment.external_reference);
    const mpStatus = mpPayment.status;
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

      const paymentStatus =
        mpStatus === 'approved'
          ? 'approved'
          : mpStatus === 'pending'
            ? 'pending'
            : 'rejected';

      await manager.save(
        manager.create(PaymentEntity, {
          orderId,
          mpPaymentId: String(mpPayment.id),
          status: paymentStatus,
          paymentMethod,
          amount: Number(mpPayment.transaction_amount ?? 0),
          rawResponse: mpPayment as unknown as object,
        }),
      );

      this.paymentsTotal.inc({
        status: paymentStatus,
        payment_method: paymentMethod ?? 'unknown',
      });

      if (mpStatus === 'approved') {
        await manager.update(Order, orderId, {
          status: OrderStatus.PAID,
          mpPaymentId: String(mpPayment.id),
        });

        this.checkoutTotal.inc({ status: 'completed' });

        const createdTickets: PurchasedTicket[] = [];
        for (const item of order.items) {
          for (let i = 0; i < item.quantity; i++) {
            const pt = await manager.save(
              manager.create(PurchasedTicket, {
                orderId,
                ticketId: item.ticketId,
                userId: order.userId,
                qrCode: uuidv4(),
                status: 'valid',
                usedAt: null,
              }),
            );
            createdTickets.push(pt);
          }
        }

        this.logger.log(
          `Order ${orderId} confirmed — ${createdTickets.length} tickets issued`,
        );

        void this.postConfirmationActions(order, createdTickets);
      } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
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

  private async postConfirmationActions(
    order: Order,
    tickets: PurchasedTicket[],
  ): Promise<void> {
    try {
      const [userRow] = await this.dataSource.query(
        `SELECT name, email FROM users WHERE id = ?`,
        [order.userId],
      );
      const [eventRow] = await this.dataSource.query(
        `SELECT title, event_date, venue_name, city FROM events WHERE id = ?`,
        [order.eventId],
      );

      if (!userRow || !eventRow) return;

      await this.dataSource.query(
        `INSERT INTO user_notifications (user_id, type, title, body, event_id)
         VALUES (?, 'purchase', ?, ?, ?)`,
        [
          order.userId,
          `🎟️ Ingresso confirmado!`,
          `Sua compra para "${eventRow.title}" foi aprovada. ${tickets.length} ingresso(s) disponíve${tickets.length > 1 ? 'is' : 'l'} na sua conta.`,
          order.eventId,
        ],
      );

      const ticketDetails = await Promise.all(
        tickets.map(async (pt) => {
          const [row] = await this.dataSource.query(
            `SELECT name, price, ticket_type FROM tickets WHERE id = ?`,
            [pt.ticketId],
          );
          return {
            name: row?.name ?? 'Ingresso',
            qrCode: pt.qrCode,
            price: Number(row?.price ?? 0),
            ticketType: row?.ticket_type ?? 'paid',
          };
        }),
      );

      const appUrl =
        this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3002';

      await this.mailerService.sendTicketConfirmation({
        buyerName: userRow.name,
        buyerEmail: userRow.email,
        eventTitle: eventRow.title,
        eventDate: eventRow.event_date,
        venueName: eventRow.venue_name,
        city: eventRow.city,
        tickets: ticketDetails,
        appUrl,
      });
    } catch (err) {
      this.logger.error('postConfirmationActions failed:', err);
    }
  }
}
