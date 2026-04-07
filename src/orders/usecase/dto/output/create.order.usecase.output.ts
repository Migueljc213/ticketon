import Order from 'src/orders/domain/entity/Order.entity';
import OrderItem from 'src/orders/domain/entity/OrderItem.entity';

export default class CreateOrderUseCaseOutput {
  order: Order;
  items: OrderItem[];

  constructor(order: Order, items: OrderItem[]) {
    this.order = order;
    this.items = items;
  }
}

