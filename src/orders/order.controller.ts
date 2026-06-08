import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import { Request } from 'express';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import {
  CancelOrderToken,
  CreateOrderToken,
  FindOrderByIdToken,
  FindOrdersByUserToken,
} from './order.token';
import type IUsecase from 'src/common/interfaces/IUseCase';
import CreateOrderUseCaseInput from './usecase/dto/input/create.order.usecase.input';
import CreateOrderUseCaseOutput from './usecase/dto/output/create.order.usecase.output';
import FindOrderByIdUseCaseInput from './usecase/dto/input/find.order.by.id.usecase.input';
import FindOrderByIdUseCaseOutput from './usecase/dto/output/find.order.by.id.usecase.output';
import FindOrdersByUserUseCaseInput from './usecase/dto/input/find.orders.by.user.usecase.input';
import FindOrdersByUserUseCaseOutput from './usecase/dto/output/find.orders.by.user.usecase.output';
import CreateOrderInputDto from './external/dto/create.order.input.dto';
import type { CancelOrderInput, CancelOrderOutput } from './usecase/cancel.order.usecase';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export default class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    @Inject(CreateOrderToken)
    private readonly createOrder: IUsecase<
      CreateOrderUseCaseInput,
      CreateOrderUseCaseOutput
    >,
    @Inject(FindOrderByIdToken)
    private readonly findOrderById: IUsecase<
      FindOrderByIdUseCaseInput,
      FindOrderByIdUseCaseOutput
    >,
    @Inject(FindOrdersByUserToken)
    private readonly findOrdersByUser: IUsecase<
      FindOrdersByUserUseCaseInput,
      FindOrdersByUserUseCaseOutput
    >,
    @Inject(CancelOrderToken)
    private readonly cancelOrder: IUsecase<CancelOrderInput, CancelOrderOutput>,
    private readonly dataSource: DataSource,
  ) {}

  @Get('participants/event/:eventId')
  async participantsList(@Param('eventId', ParseIntPipe) eventId: number) {
    this.logger.log(`GET /orders/participants/event/${eventId}`);

    const rows = await this.dataSource.query<Array<Record<string, unknown>>>(
      `SELECT
         o.id          AS orderId,
         oi.id         AS orderItemId,
         o.customer_name  AS customerName,
         o.customer_email AS customerEmail,
         o.customer_phone AS customerPhone,
         t.name           AS ticketName,
         oi.unit_price    AS ticketPrice,
         oi.qr_code       AS qrCode,
         oi.is_used       AS isCheckedIn,
         oi.used_at       AS checkedInAt,
         o.created_at     AS purchasedAt
       FROM orders o
       INNER JOIN order_items oi ON oi.order_id = o.id
       INNER JOIN tickets t ON t.id = oi.ticket_id
       WHERE o.event_id = ? AND o.status = 'paid'
       ORDER BY o.created_at DESC`,
      [eventId],
    );

    return {
      participants: rows.map((r) => ({
        orderId: r.orderId,
        orderItemId: r.orderItemId,
        customerName: r.customerName,
        customerEmail: r.customerEmail,
        customerPhone: r.customerPhone,
        ticketName: r.ticketName,
        ticketPrice: Number(r.ticketPrice),
        qrCode: r.qrCode,
        isCheckedIn: Boolean(r.isCheckedIn),
        checkedInAt: r.checkedInAt,
        purchasedAt: r.purchasedAt,
      })),
    };
  }

  @Get('dashboard/event/:eventId')
  async eventDashboard(@Param('eventId', ParseIntPipe) eventId: number) {
    this.logger.log(`GET /orders/dashboard/event/${eventId}`);

    const tickets = await this.dataSource
      .getRepository(Ticket)
      .find({ where: { eventId } });

    const ticketIds = tickets.map((t) => t.id);

    if (ticketIds.length === 0) {
      return { totalTickets: 0, checkedIn: 0, revenue: 0 };
    }

    const purchased = await this.dataSource
      .getRepository(PurchasedTicket)
      .createQueryBuilder('pt')
      .where('pt.ticketId IN (:...ids)', { ids: ticketIds })
      .getMany();

    const totalTickets = purchased.length;
    const checkedIn = purchased.filter((p) => p.status === 'used').length;

    const ticketMap = new Map(tickets.map((t) => [t.id, Number(t.price)]));
    const revenue = purchased
      .filter((p) => p.status !== 'cancelled')
      .reduce((sum, p) => sum + (ticketMap.get(p.ticketId) ?? 0), 0);

    return { totalTickets, checkedIn, revenue };
  }

  @Post()
  async create(@Body() body: CreateOrderInputDto, @Req() req: AuthRequest) {
    this.logger.log(`POST /orders - user ${req.user.id}`);
    return this.createOrder.run(
      new CreateOrderUseCaseInput({
        userId: req.user.id,
        items: body.items,
        backUrl: body.backUrl,
        customerGender: body.customerGender,
        customerAge: body.customerAge,
        customerNeighborhood: body.customerNeighborhood,
      }),
    );
  }

  @Get('my')
  async myOrders(@Req() req: AuthRequest) {
    return this.findOrdersByUser.run(
      new FindOrdersByUserUseCaseInput({ userId: req.user.id }),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.findOrderById.run(new FindOrderByIdUseCaseInput({ id }));
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    this.logger.log(`PATCH /orders/${id}/cancel - user ${req.user.id}`);
    return this.cancelOrder.run({ orderId: id, requestingUserId: req.user.id });
  }
}
