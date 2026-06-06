import Order from 'src/orders/domain/entity/Order.entity';
import IOrderRepository from 'src/orders/domain/interface/order.repository.interface';
import { OrderStatus } from 'src/orders/domain/order-status.enum';

export default class FakeOrderRepository implements IOrderRepository {
  private orders: Order[] = [];
  private nextId = 1;

  async create(input: Partial<Order>): Promise<Order> {
    const order = new Order();
    order.id = this.nextId++;
    order.userId = input.userId!;
    order.eventId = input.eventId!;
    order.totalAmount = input.totalAmount!;
    order.status = input.status || OrderStatus.PENDING;
    order.paymentMethod = input.paymentMethod || null;
    order.mpPaymentId = input.mpPaymentId || null;
    order.customerName = input.customerName!;
    order.customerEmail = input.customerEmail!;
    order.customerPhone = input.customerPhone || null;
    order.notes = input.notes || null;
    order.createdAt = input.createdAt || new Date();
    order.updatedAt = input.updatedAt || new Date();

    this.orders.push(order);
    return order;
  }

  async findById(id: number): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) || null;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.orders.filter((o) => o.userId === userId);
  }

  async findByEventId(eventId: number): Promise<Order[]> {
    return this.orders.filter((o) => o.eventId === eventId);
  }

  async findAll(): Promise<Order[]> {
    return [...this.orders];
  }

  async findExpiredPending(): Promise<Order[]> {
    const now = new Date();
    return this.orders.filter(
      (o) => o.status === OrderStatus.PENDING && o.expiresAt < now,
    );
  }

  async update(id: number, input: Partial<Order>): Promise<Order> {
    const orderIndex = this.orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    Object.keys(input).forEach((key) => {
      if (input[key] !== undefined) {
        this.orders[orderIndex][key] = input[key];
      }
    });

    this.orders[orderIndex].updatedAt = new Date();
    return this.orders[orderIndex];
  }

  async delete(id: number): Promise<void> {
    const orderIndex = this.orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    this.orders.splice(orderIndex, 1);
  }
}
