import Order from 'src/orders/domain/entity/Order.entity';
import OrderItem from 'src/orders/domain/entity/OrderItem.entity';

export class OrderWithItems {
  order: Order;
  items: OrderItem[];

  constructor(order: Order, items: OrderItem[]) {
    this.order = order;
    this.items = items;
  }
}

export default class FindOrdersByUserIdUseCaseOutput {
  orders: OrderWithItems[];

  constructor(orders: OrderWithItems[]) {
    this.orders = orders;
  }
}

