import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Order from 'src/orders/domain/entity/Order.entity';
import IOrderRepository from 'src/orders/domain/interface/order.repository.interface';
import { Repository } from 'typeorm';

@Injectable()
export default class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  async create(input: Partial<Order>): Promise<Order> {
    return this.repository.save(input);
  }

  async findById(id: number): Promise<Order | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.repository.find({ where: { userId } });
  }

  async findByEventId(eventId: number): Promise<Order[]> {
    return this.repository.find({ where: { eventId } });
  }

  async findAll(): Promise<Order[]> {
    return this.repository.find();
  }

  async update(id: number, input: Partial<Order>): Promise<Order> {
    await this.repository.update(id, input);
    const updatedOrder = await this.findById(id);
    if (!updatedOrder) {
      throw new Error('Order not found after update');
    }
    return updatedOrder;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

