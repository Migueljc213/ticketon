import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { EventPostRepositoryToken } from './event-post.token';
import type IEventPostRepository from './domain/interface/event-post.repository.interface';
import { DataSource } from 'typeorm';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

@Controller('event-posts')
export default class EventPostController {
  private readonly logger = new Logger(EventPostController.name);

  constructor(
    @Inject(EventPostRepositoryToken)
    private readonly repo: IEventPostRepository,
    private readonly dataSource: DataSource,
  ) {}

  @Get('event/:eventId')
  @HttpCode(HttpStatus.OK)
  async listPosts(@Param('eventId', ParseIntPipe) eventId: number) {
    this.logger.log(`GET /event-posts/event/${eventId}`);
    return this.repo.findByEventId(eventId);
  }

  @Post('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() body: { content: string; userName?: string },
    @Req() req: AuthRequest,
  ) {
    this.logger.log(`POST /event-posts/event/${eventId} user=${req.user.id}`);

    if (!body.content?.trim()) {
      throw new BadRequestException('Conteúdo não pode ser vazio');
    }

    // Verifica se usuário tem ingresso para este evento
    const tickets = await this.dataSource
      .getRepository(Ticket)
      .find({ where: { eventId } });

    const ticketIds = tickets.map((t) => t.id);

    if (ticketIds.length > 0) {
      const hasPurchased = await this.dataSource
        .getRepository(PurchasedTicket)
        .createQueryBuilder('pt')
        .where('pt.userId = :userId AND pt.ticketId IN (:...ids)', {
          userId: req.user.id,
          ids: ticketIds,
        })
        .getOne();

      if (!hasPurchased) {
        throw new BadRequestException(
          'Apenas participantes com ingresso podem comentar',
        );
      }
    }

    return this.repo.create({
      eventId,
      userId: req.user.id,
      userName: body.userName ?? req.user.email,
      content: body.content.trim(),
    });
  }
}
