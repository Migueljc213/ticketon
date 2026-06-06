import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import IOrderRepository from '../../domain/interface/order.repository.interface';
import Order from '../../domain/entity/Order.entity';

@Injectable()
export default class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

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

  findExpiredPending(): Promise<Order[]> {
    return this.repo.find({
      where: {
        status: 'pending_payment',
        expiresAt: LessThan(new Date()),
      },
      relations: ['items'],
    });
  }
}
