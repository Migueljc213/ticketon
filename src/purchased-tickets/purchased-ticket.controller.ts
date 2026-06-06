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
import { Request } from 'express';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import {
  FindMyTicketsToken,
  PurchasedTicketRepositoryToken,
  ValidateTicketToken,
} from './purchased-ticket.token';
import type IPurchasedTicketRepository from './domain/interface/purchased-ticket.repository.interface';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

@Controller('purchased-tickets')
@UseGuards(JwtAuthGuard)
export default class PurchasedTicketController {
  private readonly logger = new Logger(PurchasedTicketController.name);

  constructor(
    @Inject(PurchasedTicketRepositoryToken)
    private readonly repository: IPurchasedTicketRepository,
  ) {}

  /** Lista todos os ingressos comprados pelo usuário autenticado */
  @Get('my')
  async myTickets(@Req() req: AuthRequest) {
    return this.repository.findByUserId(req.user.id);
  }

  /** Valida e registra o uso de um ingresso pelo QR code (para portaria) */
  @Patch('validate/:qrCode')
  async validate(@Param('qrCode') qrCode: string) {
    const ticket = await this.repository.findByQrCode(qrCode);
    if (!ticket) throw new BadRequestException('QR code inválido');
    if (ticket.status === 'used')
      throw new BadRequestException('Ingresso já utilizado');
    if (ticket.status === 'cancelled')
      throw new BadRequestException('Ingresso cancelado');
    return this.repository.markAsUsed(qrCode);
  }
}
