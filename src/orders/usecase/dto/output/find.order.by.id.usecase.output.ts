import Order from '../../../domain/entity/Order.entity';

export default class FindOrderByIdUseCaseOutput {
  order: Order;

  constructor(partial: Partial<FindOrderByIdUseCaseOutput>) {
    Object.assign(this, partial);
  }
}
