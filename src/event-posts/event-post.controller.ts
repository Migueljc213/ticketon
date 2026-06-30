import {
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
import HasPaidTicketGuard from './guards/has-paid-ticket.guard';
import CreateEventPostDto from './external/dto/create-event-post.dto';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

@Controller('event-posts')
export default class EventPostController {
  private readonly logger = new Logger(EventPostController.name);

  constructor(
    @Inject(EventPostRepositoryToken)
    private readonly repo: IEventPostRepository,
  ) {}

  @Get('event/:eventId')
  @HttpCode(HttpStatus.OK)
  listPosts(@Param('eventId', ParseIntPipe) eventId: number) {
    this.logger.log(`GET /event-posts/event/${eventId}`);
    return this.repo.findByEventId(eventId);
  }

  @Post('event/:eventId')
  @UseGuards(JwtAuthGuard, HasPaidTicketGuard)
  @HttpCode(HttpStatus.CREATED)
  createPost(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: CreateEventPostDto,
    @Req() req: AuthRequest,
  ) {
    this.logger.log(`POST /event-posts/event/${eventId} user=${req.user.id}`);
    return this.repo.create({
      eventId,
      userId: req.user.id,
      userName: req.user.email,
      content: dto.content,
    });
  }
}
