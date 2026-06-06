import OrderItem from '../entity/OrderItem.entity';

export default interface IOrderItemRepository {
  create(input: Partial<OrderItem>): Promise<OrderItem>;
  findById(id: number): Promise<OrderItem | null>;
  findByOrderId(orderId: number): Promise<OrderItem[]>;
  findByTicketId(ticketId: number): Promise<OrderItem[]>;
  findByQrCode(qrCode: string): Promise<OrderItem | null>;
  findAll(): Promise<OrderItem[]>;
  update(id: number, input: Partial<OrderItem>): Promise<OrderItem>;
  delete(id: number): Promise<void>;
}
