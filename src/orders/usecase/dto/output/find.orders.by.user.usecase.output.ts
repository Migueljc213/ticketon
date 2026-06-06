import Order from '../../../domain/entity/Order.entity';

export default class FindOrdersByUserUseCaseOutput {
  orders: Order[];

  constructor(partial: Partial<FindOrdersByUserUseCaseOutput>) {
    Object.assign(this, partial);
  }
}
