import OrderItem from 'src/orders/domain/entity/OrderItem.entity';
import Order from 'src/orders/domain/entity/Order.entity';
import Event from 'src/events/domain/entity/Event.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';

export default class CheckInOrderItemUseCaseOutput {
  orderItem: OrderItem;
  order: Order;
  event: Event;
  ticket: Ticket;
  isValid: boolean;
  message: string;

  constructor(
    orderItem: OrderItem,
    order: Order,
    event: Event,
    ticket: Ticket,
    isValid: boolean,
    message: string,
  ) {
    this.orderItem = orderItem;
    this.order = order;
    this.event = event;
    this.ticket = ticket;
    this.isValid = isValid;
    this.message = message;
  }
}

