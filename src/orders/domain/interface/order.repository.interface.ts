import Order from '../entity/Order.entity';

export default interface IOrderRepository {
  create(input: Partial<Order>): Promise<Order>;
  findById(id: number): Promise<Order | null>;
  findByUserId(userId: number): Promise<Order[]>;
  findByEventId(eventId: number): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  findExpiredPending(): Promise<Order[]>;
  update(id: number, input: Partial<Order>): Promise<Order>;
  delete(id: number): Promise<void>;
}
