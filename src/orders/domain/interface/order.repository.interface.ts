import Order from '../entity/Order.entity';

export default interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  findByUserId(userId: number): Promise<Order[]>;
  findExpiredPending(): Promise<Order[]>;
}
