import OrderItem from 'src/orders/domain/entity/OrderItem.entity';
import IOrderItemRepository from 'src/orders/domain/interface/order-item.repository.interface';

export default class FakeOrderItemRepository implements IOrderItemRepository {
  private orderItems: OrderItem[] = [];
  private nextId = 1;

  async create(input: Partial<OrderItem>): Promise<OrderItem> {
    const orderItem = new OrderItem();
    orderItem.id = this.nextId++;
    orderItem.orderId = input.orderId!;
    orderItem.ticketId = input.ticketId!;
    orderItem.quantity = input.quantity!;
    orderItem.unitPrice = input.unitPrice!;
    orderItem.totalPrice = input.totalPrice!;
    orderItem.qrCode = input.qrCode || null;
    orderItem.qrCodeData = input.qrCodeData || null;
    orderItem.isUsed = input.isUsed || false;
    orderItem.usedAt = input.usedAt || null;
    orderItem.checkedInBy = input.checkedInBy || null;
    orderItem.createdAt = new Date();
    orderItem.updatedAt = new Date();

    this.orderItems.push(orderItem);
    return orderItem;
  }

  async findById(id: number): Promise<OrderItem | null> {
    return this.orderItems.find((oi) => oi.id === id) || null;
  }

  async findByOrderId(orderId: number): Promise<OrderItem[]> {
    return this.orderItems.filter((oi) => oi.orderId === orderId);
  }

  async findByTicketId(ticketId: number): Promise<OrderItem[]> {
    return this.orderItems.filter((oi) => oi.ticketId === ticketId);
  }

  async findByQrCode(qrCode: string): Promise<OrderItem | null> {
    return this.orderItems.find((oi) => oi.qrCode === qrCode) || null;
  }

  async findAll(): Promise<OrderItem[]> {
    return [...this.orderItems];
  }

  async update(id: number, input: Partial<OrderItem>): Promise<OrderItem> {
    const itemIndex = this.orderItems.findIndex((oi) => oi.id === id);
    if (itemIndex === -1) {
      throw new Error('OrderItem not found');
    }

    Object.keys(input).forEach((key) => {
      if (input[key] !== undefined) {
        this.orderItems[itemIndex][key] = input[key];
      }
    });

    this.orderItems[itemIndex].updatedAt = new Date();
    return this.orderItems[itemIndex];
  }

  async delete(id: number): Promise<void> {
    const itemIndex = this.orderItems.findIndex((oi) => oi.id === id);
    if (itemIndex === -1) {
      throw new Error('OrderItem not found');
    }
    this.orderItems.splice(itemIndex, 1);
  }
}
