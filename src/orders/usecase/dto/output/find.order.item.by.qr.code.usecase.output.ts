import OrderItem from 'src/orders/domain/entity/OrderItem.entity';
import Order from 'src/orders/domain/entity/Order.entity';
import Event from 'src/events/domain/entity/Event.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';

export default class FindOrderItemByQrCodeUseCaseOutput {
  orderItem: OrderItem;
  order: Order;
  event: Event;
  ticket: Ticket;

  constructor(
    orderItem: OrderItem,
    order: Order,
    event: Event,
    ticket: Ticket,
  ) {
    this.orderItem = orderItem;
    this.order = order;
    this.event = event;
    this.ticket = ticket;
  }
}
