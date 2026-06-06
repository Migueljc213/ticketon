import Order from 'src/orders/domain/entity/Order.entity';
import OrderItem from 'src/orders/domain/entity/OrderItem.entity';
import Event from 'src/events/domain/entity/Event.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import { OrderStatus } from 'src/orders/domain/order-status.enum';
import { TEST_CONSTANTS } from './test-constants';

type PartialOrder = Partial<Order>;
type PartialOrderItem = Partial<OrderItem>;
type PartialEvent = Partial<Event>;
type PartialTicket = Partial<Ticket>;

export class OrderTestBuilder {
  private order: Order;

  constructor(overrides?: PartialOrder) {
    this.order = new Order();
    this.order.id = overrides?.id ?? TEST_CONSTANTS.IDS.DEFAULT_ORDER_ID;
    this.order.userId = overrides?.userId ?? TEST_CONSTANTS.IDS.DEFAULT_USER_ID;
    this.order.eventId =
      overrides?.eventId ?? TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID;
    this.order.totalAmount =
      overrides?.totalAmount ?? TEST_CONSTANTS.PRICES.DEFAULT_ORDER_TOTAL;
    this.order.status = overrides?.status ?? OrderStatus.PAID;
    this.order.customerName =
      overrides?.customerName ?? TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME;
    this.order.customerEmail =
      overrides?.customerEmail ?? TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL;
    this.order.customerPhone =
      overrides?.customerPhone ?? TEST_CONSTANTS.CUSTOMERS.DEFAULT_PHONE;
    this.order.paymentMethod = overrides?.paymentMethod ?? (null as any);
    this.order.mpPaymentId = overrides?.mpPaymentId ?? (null as any);
    this.order.notes = overrides?.notes ?? (null as any);
    this.order.createdAt = overrides?.createdAt ?? new Date();
    this.order.updatedAt = overrides?.updatedAt ?? new Date();

    if (overrides) {
      Object.assign(this.order, overrides);
    }
  }

  withId(id: number): OrderTestBuilder {
    this.order.id = id;
    return this;
  }

  withUserId(userId: number): OrderTestBuilder {
    this.order.userId = userId;
    return this;
  }

  withEventId(eventId: number): OrderTestBuilder {
    this.order.eventId = eventId;
    return this;
  }

  withStatus(status: OrderStatus): OrderTestBuilder {
    this.order.status = status;
    return this;
  }

  withTotalAmount(amount: number): OrderTestBuilder {
    this.order.totalAmount = amount;
    return this;
  }

  withCustomer(customerName: string, customerEmail: string): OrderTestBuilder {
    this.order.customerName = customerName;
    this.order.customerEmail = customerEmail;
    return this;
  }

  withCreatedAt(date: Date): OrderTestBuilder {
    this.order.createdAt = date;
    return this;
  }

  asPending(): OrderTestBuilder {
    this.order.status = OrderStatus.PENDING;
    return this;
  }

  asPaid(): OrderTestBuilder {
    this.order.status = OrderStatus.PAID;
    return this;
  }

  build(): Order {
    return this.order;
  }
}

export class OrderItemTestBuilder {
  private orderItem: OrderItem;

  constructor(overrides?: PartialOrderItem) {
    this.orderItem = new OrderItem();
    this.orderItem.id =
      overrides?.id ?? TEST_CONSTANTS.IDS.DEFAULT_ORDER_ITEM_ID;
    this.orderItem.orderId =
      overrides?.orderId ?? TEST_CONSTANTS.IDS.DEFAULT_ORDER_ID;
    this.orderItem.ticketId =
      overrides?.ticketId ?? TEST_CONSTANTS.IDS.DEFAULT_TICKET_ID;
    this.orderItem.quantity =
      overrides?.quantity ?? TEST_CONSTANTS.QUANTITIES.DEFAULT_QUANTITY;
    this.orderItem.unitPrice =
      overrides?.unitPrice ?? TEST_CONSTANTS.PRICES.DEFAULT_UNIT_PRICE;
    this.orderItem.totalPrice =
      overrides?.totalPrice ?? TEST_CONSTANTS.PRICES.DEFAULT_TOTAL_PRICE;
    this.orderItem.qrCode =
      overrides?.qrCode ?? TEST_CONSTANTS.QR_CODES.DEFAULT;
    this.orderItem.qrCodeData = overrides?.qrCodeData ?? (null as any);
    this.orderItem.isUsed = overrides?.isUsed ?? false;
    this.orderItem.usedAt = overrides?.usedAt ?? (null as any);
    this.orderItem.checkedInBy = overrides?.checkedInBy ?? (null as any);
    this.orderItem.createdAt = overrides?.createdAt ?? new Date();
    this.orderItem.updatedAt = overrides?.updatedAt ?? new Date();

    if (overrides) {
      Object.assign(this.orderItem, overrides);
    }
  }

  withId(id: number): OrderItemTestBuilder {
    this.orderItem.id = id;
    return this;
  }

  withOrderId(orderId: number): OrderItemTestBuilder {
    this.orderItem.orderId = orderId;
    return this;
  }

  withTicketId(ticketId: number): OrderItemTestBuilder {
    this.orderItem.ticketId = ticketId;
    return this;
  }

  withQrCode(qrCode: string): OrderItemTestBuilder {
    this.orderItem.qrCode = qrCode;
    return this;
  }

  withQuantity(quantity: number): OrderItemTestBuilder {
    this.orderItem.quantity = quantity;
    return this;
  }

  withUnitPrice(price: number): OrderItemTestBuilder {
    this.orderItem.unitPrice = price;
    return this;
  }

  withTotalPrice(price: number): OrderItemTestBuilder {
    this.orderItem.totalPrice = price;
    return this;
  }

  asUsed(checkedInBy?: number): OrderItemTestBuilder {
    this.orderItem.isUsed = true;
    this.orderItem.usedAt = new Date();
    this.orderItem.checkedInBy = checkedInBy ?? (null as any);
    return this;
  }

  asUnused(): OrderItemTestBuilder {
    this.orderItem.isUsed = false;
    this.orderItem.usedAt = null as any;
    this.orderItem.checkedInBy = null as any;
    return this;
  }

  build(): OrderItem {
    return this.orderItem;
  }
}

export class EventTestBuilder {
  private event: Event;

  constructor(overrides?: PartialEvent) {
    this.event = new Event();
    this.event.id = overrides?.id ?? TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID;
    this.event.organizerId =
      overrides?.organizerId ?? TEST_CONSTANTS.IDS.DEFAULT_ORGANIZER_ID;
    this.event.title = overrides?.title ?? TEST_CONSTANTS.EVENTS.DEFAULT_TITLE;
    this.event.description =
      overrides?.description ?? TEST_CONSTANTS.EVENTS.DEFAULT_DESCRIPTION;
    this.event.category =
      overrides?.category ?? TEST_CONSTANTS.EVENTS.DEFAULT_CATEGORY;
    this.event.eventDate =
      overrides?.eventDate ?? TEST_CONSTANTS.DATES.ONE_DAY_AGO;
    this.event.locationType =
      overrides?.locationType ?? TEST_CONSTANTS.EVENTS.DEFAULT_LOCATION_TYPE;
    this.event.isPublic = overrides?.isPublic ?? true;
    this.event.isPublished = overrides?.isPublished ?? false;
    this.event.status = overrides?.status ?? 'published';
    this.event.createdAt = overrides?.createdAt ?? new Date();
    this.event.updatedAt = overrides?.updatedAt ?? new Date();

    if (overrides) {
      Object.assign(this.event, overrides);
    }
  }

  withId(id: number): EventTestBuilder {
    this.event.id = id;
    return this;
  }

  withOrganizerId(organizerId: number): EventTestBuilder {
    this.event.organizerId = organizerId;
    return this;
  }

  withEventDate(date: Date): EventTestBuilder {
    this.event.eventDate = date;
    return this;
  }

  inThePast(): EventTestBuilder {
    this.event.eventDate = TEST_CONSTANTS.DATES.ONE_DAY_AGO;
    return this;
  }

  inTheFuture(): EventTestBuilder {
    this.event.eventDate = TEST_CONSTANTS.DATES.ONE_DAY_FROM_NOW;
    return this;
  }

  build(): Event {
    return this.event;
  }
}

export class TicketTestBuilder {
  private ticket: Ticket;

  constructor(overrides?: PartialTicket) {
    this.ticket = new Ticket();
    this.ticket.id = overrides?.id ?? TEST_CONSTANTS.IDS.DEFAULT_TICKET_ID;
    this.ticket.eventId =
      overrides?.eventId ?? TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID;
    this.ticket.name = overrides?.name ?? TEST_CONSTANTS.TICKETS.DEFAULT_NAME;
    this.ticket.description =
      overrides?.description ?? TEST_CONSTANTS.TICKETS.DEFAULT_DESCRIPTION;
    this.ticket.price =
      overrides?.price ?? TEST_CONSTANTS.PRICES.DEFAULT_TICKET_PRICE;
    this.ticket.quantityAvailable =
      overrides?.quantityAvailable ??
      TEST_CONSTANTS.QUANTITIES.DEFAULT_QUANTITY_AVAILABLE;
    this.ticket.quantitySold =
      overrides?.quantitySold ??
      TEST_CONSTANTS.QUANTITIES.DEFAULT_QUANTITY_SOLD;
    this.ticket.isActive = overrides?.isActive ?? true;
    this.ticket.minPerOrder = overrides?.minPerOrder ?? 1;
    this.ticket.maxPerOrder = overrides?.maxPerOrder ?? 10;
    this.ticket.ticketType = overrides?.ticketType ?? 'paid';
    this.ticket.createdAt = overrides?.createdAt ?? new Date();
    this.ticket.updatedAt = overrides?.updatedAt ?? new Date();

    if (overrides) {
      Object.assign(this.ticket, overrides);
    }
  }

  withId(id: number): TicketTestBuilder {
    this.ticket.id = id;
    return this;
  }

  withEventId(eventId: number): TicketTestBuilder {
    this.ticket.eventId = eventId;
    return this;
  }

  withPrice(price: number): TicketTestBuilder {
    this.ticket.price = price;
    return this;
  }

  withQuantityAvailable(quantity: number): TicketTestBuilder {
    this.ticket.quantityAvailable = quantity;
    return this;
  }

  withQuantitySold(quantity: number): TicketTestBuilder {
    this.ticket.quantitySold = quantity;
    return this;
  }

  asActive(): TicketTestBuilder {
    this.ticket.isActive = true;
    return this;
  }

  asInactive(): TicketTestBuilder {
    this.ticket.isActive = false;
    return this;
  }

  build(): Ticket {
    return this.ticket;
  }
}
