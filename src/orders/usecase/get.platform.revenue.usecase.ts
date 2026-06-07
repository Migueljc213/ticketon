import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrderRepository from '../domain/interface/order.repository.interface';
import { OrderRepositoryToken } from '../order.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import GetPlatformRevenueUseCaseOutput from './dto/output/get.platform.revenue.usecase.output';
import { OrderStatus } from '../domain/order-status.enum';

@Injectable()
export default class GetPlatformRevenueUseCase implements IUsecase<
  void,
  GetPlatformRevenueUseCaseOutput
> {
  private readonly logger = new Logger(GetPlatformRevenueUseCase.name);
  private readonly PLATFORM_FEE_PERCENTAGE = 0.07;

  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async run(): Promise<GetPlatformRevenueUseCaseOutput> {
    this.logger.log('Getting platform revenue');

    const allOrders = await this.orderRepository.findAll();
    const paidOrders = allOrders.filter(
      (order) => order.status === OrderStatus.PAID,
    );

    let totalRevenue = 0;
    const revenueByMonthMap: Map<string, number> = new Map();

    for (const order of paidOrders) {
      const orderAmount = Number(order.totalAmount);
      totalRevenue += orderAmount;

      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonthMap.set(
        monthKey,
        (revenueByMonthMap.get(monthKey) || 0) + orderAmount,
      );
    }

    const platformFee = totalRevenue * this.PLATFORM_FEE_PERCENTAGE;
    const netRevenue = totalRevenue - platformFee;

    const revenueByMonth = Array.from(revenueByMonthMap.entries())
      .map(([month, revenue]) => ({
        month,
        revenue: Number(revenue.toFixed(2)),
        platformFee: Number(
          (revenue * this.PLATFORM_FEE_PERCENTAGE).toFixed(2),
        ),
        netRevenue: Number(
          (revenue * (1 - this.PLATFORM_FEE_PERCENTAGE)).toFixed(2),
        ),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return new GetPlatformRevenueUseCaseOutput({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      platformFee: Number(platformFee.toFixed(2)),
      netRevenue: Number(netRevenue.toFixed(2)),
      totalOrders: paidOrders.length,
      revenueByMonth,
    });
  }
}
