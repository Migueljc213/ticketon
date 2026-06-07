import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrderRepository from '../domain/interface/order.repository.interface';
import type IOrderItemRepository from '../domain/interface/order-item.repository.interface';
import type IEventRepository from 'src/events/domain/interface/event.repository.interface';
import { OrderRepositoryToken, OrderItemRepositoryToken } from '../order.token';
import { EventRepositoryToken } from 'src/events/event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import GetCheckInDashboardUseCaseInput from './dto/input/get.checkin.dashboard.usecase.input';
import GetCheckInDashboardUseCaseOutput from './dto/output/get.checkin.dashboard.usecase.output';
import { OrderStatus } from '../domain/order-status.enum';

@Injectable()
export default class GetCheckInDashboardUseCase implements IUsecase<
  GetCheckInDashboardUseCaseInput,
  GetCheckInDashboardUseCaseOutput
> {
  private readonly logger = new Logger(GetCheckInDashboardUseCase.name);
  private readonly PLATFORM_FEE_PERCENTAGE = 0.07;

  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @Inject(OrderItemRepositoryToken)
    private readonly orderItemRepository: IOrderItemRepository,
    @Inject(EventRepositoryToken)
    private readonly eventRepository: IEventRepository,
  ) {}

  async run(
    input: GetCheckInDashboardUseCaseInput,
  ): Promise<GetCheckInDashboardUseCaseOutput> {
    this.logger.log('Getting check-in dashboard for event', input.eventId);

    const orders = await this.orderRepository.findByEventId(input.eventId);
    const paidOrders = orders.filter(
      (order) => order.status === OrderStatus.PAID,
    );
    let totalTicketsSold = 0;
    let totalTicketsCheckedIn = 0;
    let totalRevenue = 0;
    const checkedInByDate: Map<string, number> = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkedInToday = 0;

    for (const order of paidOrders) {
      totalRevenue += Number(order.totalAmount);
      const items = await this.orderItemRepository.findByOrderId(order.id);
      totalTicketsSold += items.length;

      for (const item of items) {
        if (item.isUsed && item.usedAt) {
          totalTicketsCheckedIn++;
          const usedDate = new Date(item.usedAt);
          usedDate.setHours(0, 0, 0, 0);
          const dateKey = usedDate.toISOString().split('T')[0];

          if (usedDate.getTime() === today.getTime()) {
            checkedInToday++;
          }

          checkedInByDate.set(dateKey, (checkedInByDate.get(dateKey) || 0) + 1);
        }
      }
    }

    const totalTicketsPending = totalTicketsSold - totalTicketsCheckedIn;
    const attendanceRate =
      totalTicketsSold > 0
        ? (totalTicketsCheckedIn / totalTicketsSold) * 100
        : 0;

    const grossRevenue = totalRevenue;
    const platformFee = grossRevenue * this.PLATFORM_FEE_PERCENTAGE;
    const netRevenue = grossRevenue - platformFee;

    const checkedInByPeriod = Array.from(checkedInByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return new GetCheckInDashboardUseCaseOutput({
      totalTicketsSold,
      totalTicketsCheckedIn,
      totalTicketsPending,
      attendanceRate: Number(attendanceRate.toFixed(2)),
      checkedInToday,
      checkedInByPeriod,
      revenue: {
        gross: Number(grossRevenue.toFixed(2)),
        net: Number(netRevenue.toFixed(2)),
        platformFee: Number(platformFee.toFixed(2)),
      },
    });
  }
}
