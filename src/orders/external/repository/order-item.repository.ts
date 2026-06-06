import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import OrderItem from 'src/orders/domain/entity/OrderItem.entity';
import IOrderItemRepository from 'src/orders/domain/interface/order-item.repository.interface';
import { Repository } from 'typeorm';

@Injectable()
export default class OrderItemRepository implements IOrderItemRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repository: Repository<OrderItem>,
  ) {}

  async create(input: Partial<OrderItem>): Promise<OrderItem> {
    return this.repository.save(input);
  }

  async findById(id: number): Promise<OrderItem | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByOrderId(orderId: number): Promise<OrderItem[]> {
    return this.repository.find({ where: { orderId } });
  }

  async findByTicketId(ticketId: number): Promise<OrderItem[]> {
    return this.repository.find({ where: { ticketId } });
  }

  async findByQrCode(qrCode: string): Promise<OrderItem | null> {
    return this.repository.findOne({ where: { qrCode } });
  }

  async findAll(): Promise<OrderItem[]> {
    return this.repository.find();
  }

  async update(id: number, input: Partial<OrderItem>): Promise<OrderItem> {
    await this.repository.update(id, input);
    const updatedItem = await this.findById(id);
    if (!updatedItem) {
      throw new Error('OrderItem not found after update');
    }
    return updatedItem;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
