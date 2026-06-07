import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import IUsecase from 'src/common/interfaces/IUseCase';
import { OrderRepositoryToken } from '../order.token';
import type IOrderRepository from '../domain/interface/order.repository.interface';
import FindOrderByIdUseCaseInput from './dto/input/find.order.by.id.usecase.input';
import FindOrderByIdUseCaseOutput from './dto/output/find.order.by.id.usecase.output';

@Injectable()
export default class FindOrderByIdUseCase implements IUsecase<
  FindOrderByIdUseCaseInput,
  FindOrderByIdUseCaseOutput
> {
  private readonly logger = new Logger(FindOrderByIdUseCase.name);

  constructor(
    @Inject(OrderRepositoryToken)
    private readonly repository: IOrderRepository,
  ) {}

  async run(
    input: FindOrderByIdUseCaseInput,
  ): Promise<FindOrderByIdUseCaseOutput> {
    this.logger.log(`Finding order ${input.id}`);
    const order = await this.repository.findById(input.id);
    if (!order)
      throw new NotFoundException(`Pedido ${input.id} não encontrado`);
    return new FindOrderByIdUseCaseOutput({ order });
  }
}
