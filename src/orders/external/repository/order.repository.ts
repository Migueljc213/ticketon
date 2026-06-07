import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import IOrderRepository from '../../domain/interface/order.repository.interface';
import Order from '../../domain/entity/Order.entity';
import { OrderStatus } from '../../domain/order-status.enum';

@Injectable()
export default class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  create(input: Partial<Order>): Promise<Order> {
    const order = this.repo.create(input);
    return this.repo.save(order);
  }

  findById(id: number): Promise<Order | null> {
    return this.repo.findOne({ where: { id }, relations: ['items'] });
  }

  findByUserId(userId: number): Promise<Order[]> {
    return this.repo.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  findByEventId(eventId: number): Promise<Order[]> {
    return this.repo.find({
      where: { eventId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  findAll(): Promise<Order[]> {
    return this.repo.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  findExpiredPending(): Promise<Order[]> {
    return this.repo.find({
      where: {
        status: OrderStatus.PENDING,
        expiresAt: LessThan(new Date()),
      },
      relations: ['items'],
    });
  }

  async update(id: number, input: Partial<Order>): Promise<Order> {
    await this.repo.update(id, input);
    return this.repo.findOneOrFail({ where: { id }, relations: ['items'] });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
