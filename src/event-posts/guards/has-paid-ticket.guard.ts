import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Request } from 'express';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';

interface AuthUser {
  id: number;
  email: string;
}

@Injectable()
export default class HasPaidTicketGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user: AuthUser }>();
    const userId = req.user?.id;
    const eventId = parseInt(req.params.eventId, 10);

    if (!userId || isNaN(eventId)) {
      throw new ForbiddenException('Acesso não autorizado.');
    }

    const ticket = await this.dataSource
      .getRepository(PurchasedTicket)
      .createQueryBuilder('pt')
      .innerJoin(Ticket, 't', 't.id = pt.ticketId')
      .where('t.eventId = :eventId AND pt.userId = :userId', {
        eventId,
        userId,
      })
      .getOne();

    if (!ticket) {
      throw new ForbiddenException(
        'Apenas participantes com ingresso confirmado podem interagir neste mural.',
      );
    }

    return true;
  }
}
