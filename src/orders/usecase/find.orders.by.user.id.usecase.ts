import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrderRepository from '../domain/interface/order.repository.interface';
import type IOrderItemRepository from '../domain/interface/order-item.repository.interface';
import { OrderRepositoryToken, OrderItemRepositoryToken } from '../order.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindOrdersByUserIdUseCaseInput from './dto/input/find.orders.by.user.id.usecase.input';
import FindOrdersByUserIdUseCaseOutput, {
  OrderWithItems,
} from './dto/output/find.orders.by.user.id.usecase.output';

@Injectable()
export default class FindOrdersByUserIdUseCase
  implements
    IUsecase<FindOrdersByUserIdUseCaseInput, FindOrdersByUserIdUseCaseOutput>
{
  private readonly logger = new Logger(FindOrdersByUserIdUseCase.name);

  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @Inject(OrderItemRepositoryToken)
    private readonly orderItemRepository: IOrderItemRepository,
  ) {}

  async run(
    input: FindOrdersByUserIdUseCaseInput,
  ): Promise<FindOrdersByUserIdUseCaseOutput> {
    this.logger.log('Finding orders for user', input.userId);

    const orders = await this.orderRepository.findByUserId(input.userId);

    const ordersWithItems: OrderWithItems[] = await Promise.all(
      orders.map(async (order) => {
        const items = await this.orderItemRepository.findByOrderId(order.id);
        return new OrderWithItems(order, items);
      }),
    );

    return new FindOrdersByUserIdUseCaseOutput(ordersWithItems);
  }
}

