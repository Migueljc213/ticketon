import { Inject, Injectable, Logger } from '@nestjs/common';
import IUsecase from 'src/common/interfaces/IUseCase';
import { OrderRepositoryToken } from '../order.token';
import type IOrderRepository from '../domain/interface/order.repository.interface';
import FindOrdersByUserUseCaseInput from './dto/input/find.orders.by.user.usecase.input';
import FindOrdersByUserUseCaseOutput from './dto/output/find.orders.by.user.usecase.output';

@Injectable()
export default class FindOrdersByUserUseCase
  implements
    IUsecase<FindOrdersByUserUseCaseInput, FindOrdersByUserUseCaseOutput>
{
  private readonly logger = new Logger(FindOrdersByUserUseCase.name);

  constructor(
    @Inject(OrderRepositoryToken)
    private readonly repository: IOrderRepository,
  ) {}

  async run(
    input: FindOrdersByUserUseCaseInput,
  ): Promise<FindOrdersByUserUseCaseOutput> {
    this.logger.log(`Finding orders for user ${input.userId}`);
    const orders = await this.repository.findByUserId(input.userId);
    return new FindOrdersByUserUseCaseOutput({ orders });
  }
}
