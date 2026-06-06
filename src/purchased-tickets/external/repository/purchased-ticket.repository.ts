import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import IPurchasedTicketRepository from '../../domain/interface/purchased-ticket.repository.interface';
import PurchasedTicket from '../../domain/entity/PurchasedTicket.entity';

@Injectable()
export default class PurchasedTicketRepository implements IPurchasedTicketRepository {
  constructor(
    @InjectRepository(PurchasedTicket)
    private readonly repo: Repository<PurchasedTicket>,
  ) {}

  findByUserId(userId: number): Promise<PurchasedTicket[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findByQrCode(qrCode: string): Promise<PurchasedTicket | null> {
    return this.repo.findOne({ where: { qrCode } });
  }

  findByOrderId(orderId: number): Promise<PurchasedTicket[]> {
    return this.repo.find({ where: { orderId } });
  }

  async markAsUsed(qrCode: string): Promise<PurchasedTicket> {
    const ticket = await this.repo.findOne({ where: { qrCode } });
    if (!ticket) throw new NotFoundException('Ingresso não encontrado');
    ticket.status = 'used';
    ticket.usedAt = new Date();
    return this.repo.save(ticket);
  }
}
