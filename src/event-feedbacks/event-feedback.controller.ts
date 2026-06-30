import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { EventFeedbackRepositoryToken } from './event-feedback.token';
import type IEventFeedbackRepository from './domain/interface/event-feedback.repository.interface';
import CreateEventFeedbackDto from './external/dto/create-event-feedback.dto';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

@Controller('event-feedbacks')
export default class EventFeedbackController {
  constructor(
    @Inject(EventFeedbackRepositoryToken)
    private readonly repo: IEventFeedbackRepository,
  ) {}

  @Post('event/:eventId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: CreateEventFeedbackDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user?.id ?? null;

    if (dto.purchasedTicketId) {
      const already = await this.repo.hasSubmitted(
        eventId,
        dto.purchasedTicketId,
      );
      if (already) {
        return { message: 'Você já enviou sua avaliação para este evento.' };
      }
    }

    const feedback = await this.repo.create({
      eventId,
      purchasedTicketId: dto.purchasedTicketId,
      userId,
      npsScore: dto.npsScore,
      soundRating: dto.soundRating,
      bathroomRating: dto.bathroomRating,
      barWaitRating: dto.barWaitRating,
      securityRating: dto.securityRating,
      openComment: dto.openComment,
    });

    return { message: 'Obrigado pelo seu feedback!', id: feedback.id };
  }

  @Get('event/:eventId/summary')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getSummary(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.repo.getSummary(eventId);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  listFeedbacks(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.repo.findByEventId(eventId);
  }
}
