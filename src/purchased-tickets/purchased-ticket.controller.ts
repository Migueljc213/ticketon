import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Request } from 'express';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { PurchasedTicketRepositoryToken } from './purchased-ticket.token';
import type IPurchasedTicketRepository from './domain/interface/purchased-ticket.repository.interface';
import PurchasedTicket from './domain/entity/PurchasedTicket.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import Event from 'src/events/domain/entity/Event.entity';
import User from 'src/users/domain/entity/User.entity';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

interface TicketInfo {
  id: number;
  qrCode: string;
  status: string;
  usedAt: string | null;
  buyer: {
    id: number;
    name: string;
    email: string;
    cpfCnpj: string | null;
  };
  ticket: {
    id: number;
    name: string;
    price: number;
    ticketType: string;
  };
  event: {
    id: number;
    title: string;
    eventDate: string;
    venueName: string | null;
    city: string | null;
  };
}

@Controller('purchased-tickets')
@UseGuards(JwtAuthGuard)
export default class PurchasedTicketController {
  private readonly logger = new Logger(PurchasedTicketController.name);

  constructor(
    @Inject(PurchasedTicketRepositoryToken)
    private readonly repository: IPurchasedTicketRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /** Lista todos os ingressos comprados pelo usuário autenticado */
  @Get('my')
  async myTickets(@Req() req: AuthRequest) {
    return this.repository.findByUserId(req.user.id);
  }

  /**
   * Retorna os dados completos de um ingresso pelo QR code
   * sem marcá-lo como usado. Útil para pré-visualização na portaria.
   */
  @Get('info/:qrCode')
  async info(@Param('qrCode') qrCode: string) {
    return this.buildTicketInfo(qrCode);
  }

  /**
   * Valida e registra o uso de um ingresso pelo QR code.
   * Retorna dados enriquecidos (comprador, evento, lote) para exibição na portaria.
   */
  @Patch('validate/:qrCode')
  async validate(@Param('qrCode') qrCode: string) {
    const ticket = await this.repository.findByQrCode(qrCode);

    if (!ticket) {
      throw new BadRequestException('QR code inválido — ingresso não encontrado.');
    }
    if (ticket.status === 'used') {
      // Retorna os dados mesmo assim para o organizador saber quem tentou reutilizar
      const info = await this.buildTicketInfo(qrCode);
      throw new BadRequestException({
        message: 'Ingresso já utilizado.',
        usedAt: ticket.usedAt,
        ticket: info,
      });
    }
    if (ticket.status === 'cancelled') {
      throw new BadRequestException('Ingresso cancelado.');
    }

    await this.repository.markAsUsed(qrCode);
    this.logger.log(`Ingresso ${qrCode} validado com sucesso`);

    return this.buildTicketInfo(qrCode);
  }

  /** Monta resposta enriquecida com dados do comprador, lote e evento */
  private async buildTicketInfo(qrCode: string): Promise<TicketInfo> {
    const pt = await this.dataSource
      .getRepository(PurchasedTicket)
      .findOne({ where: { qrCode } });

    if (!pt) throw new BadRequestException('QR code inválido — ingresso não encontrado.');

    const [ticketEntity, user] = await Promise.all([
      this.dataSource.getRepository(Ticket).findOne({ where: { id: pt.ticketId } }),
      this.dataSource.getRepository(User).findOne({ where: { id: pt.userId } }),
    ]);

    const event = ticketEntity
      ? await this.dataSource.getRepository(Event).findOne({ where: { id: ticketEntity.eventId } })
      : null;

    return {
      id: pt.id,
      qrCode: pt.qrCode,
      status: pt.status,
      usedAt: pt.usedAt ? pt.usedAt.toISOString() : null,
      buyer: {
        id: pt.userId,
        name: user?.name ?? 'Desconhecido',
        email: user?.email ?? '',
        cpfCnpj: user?.cpfCnpj ?? null,
      },
      ticket: {
        id: pt.ticketId,
        name: ticketEntity?.name ?? 'Ingresso',
        price: Number(ticketEntity?.price ?? 0),
        ticketType: ticketEntity?.ticketType ?? 'paid',
      },
      event: {
        id: event?.id ?? 0,
        title: event?.title ?? 'Evento',
        eventDate: event?.eventDate ? new Date(event.eventDate).toISOString() : '',
        venueName: event?.venueName ?? null,
        city: event?.city ?? null,
      },
    };
  }
}
