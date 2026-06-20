import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'O conteúdo é obrigatório' })
  @MaxLength(2000, { message: 'Máximo de 2000 caracteres' })
  content: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUrl({}, { message: 'Link inválido' })
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  linkTitle?: string;
}

class CreatePollDto {
  @IsString()
  @IsNotEmpty({ message: 'A pergunta é obrigatória' })
  @MaxLength(500, { message: 'Máximo de 500 caracteres' })
  question: string;

  @IsArray({ message: 'As opções devem ser um array' })
  @MinLength(2, {
    each: true,
    message: 'Cada opção deve ter pelo menos 2 caracteres',
  })
  options: string[];
}

@Controller('organizer-content')
export default class OrganizerContentController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  // ── GET posts ─────────────────────────────────────────────────────────────────
  @Get(':organizerId/posts')
  @HttpCode(HttpStatus.OK)
  async getPosts(@Param('organizerId', ParseIntPipe) organizerId: number) {
    return this.ds.query<Array<Record<string, unknown>>>(
      `SELECT id, organizer_id AS organizerId, content,
              image_url AS imageUrl, link_url AS linkUrl, link_title AS linkTitle,
              created_at AS createdAt
       FROM organizer_posts
       WHERE organizer_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [organizerId],
    );
  }

  // ── POST post ─────────────────────────────────────────────────────────────────
  @Post(':organizerId/post')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Body() dto: CreatePostDto,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    const result = await this.ds.query(
      `INSERT INTO organizer_posts (organizer_id, content, image_url, link_url, link_title)
       VALUES (?, ?, ?, ?, ?)`,
      [organizerId, dto.content, dto.imageUrl ?? null, dto.linkUrl ?? null, dto.linkTitle ?? null],
    );
    return {
      id: result.insertId,
      organizerId,
      content: dto.content,
      imageUrl: dto.imageUrl ?? null,
      linkUrl: dto.linkUrl ?? null,
      linkTitle: dto.linkTitle ?? null,
    };
  }

  // ── GET polls ─────────────────────────────────────────────────────────────────
  @Get(':organizerId/polls')
  @HttpCode(HttpStatus.OK)
  async getPolls(@Param('organizerId', ParseIntPipe) organizerId: number) {
    const polls = await this.ds.query<Array<Record<string, unknown>>>(
      `SELECT p.id, p.organizer_id AS organizerId, p.question, p.options,
              p.created_at AS createdAt,
              COUNT(v.id) AS totalVotes
       FROM organizer_polls p
       LEFT JOIN poll_votes v ON v.poll_id = p.id
       WHERE p.organizer_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT 20`,
      [organizerId],
    );

    return polls.map((p) => {
      const options: string[] = JSON.parse(p.options as string);
      return { ...p, options };
    });
  }

  // ── GET poll vote counts ──────────────────────────────────────────────────────
  @Get('polls/:pollId/results')
  @HttpCode(HttpStatus.OK)
  async getPollResults(@Param('pollId', ParseIntPipe) pollId: number) {
    const rows = await this.ds.query<
      Array<{ optionIndex: number; count: string }>
    >(
      `SELECT option_index AS optionIndex, COUNT(*) AS count
       FROM poll_votes WHERE poll_id = ?
       GROUP BY option_index`,
      [pollId],
    );
    const votes: Record<number, number> = {};
    rows.forEach((r) => {
      votes[r.optionIndex] = Number(r.count);
    });
    return { pollId, votes };
  }

  // ── POST poll ─────────────────────────────────────────────────────────────────
  @Post(':organizerId/poll')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPoll(
    @Param('organizerId', ParseIntPipe) organizerId: number,
    @Body() dto: CreatePollDto,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(req.user.id, organizerId);
    if (!dto.options || dto.options.length < 2) {
      throw new UnauthorizedException(
        'A enquete precisa de pelo menos 2 opções',
      );
    }
    const result = await this.ds.query(
      `INSERT INTO organizer_polls (organizer_id, question, options) VALUES (?, ?, ?)`,
      [organizerId, dto.question, JSON.stringify(dto.options)],
    );
    return {
      id: result.insertId,
      organizerId,
      question: dto.question,
      options: dto.options,
    };
  }

  // ── POST vote ─────────────────────────────────────────────────────────────────
  @Post('polls/:pollId/vote')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async vote(
    @Param('pollId', ParseIntPipe) pollId: number,
    @Body('optionIndex') optionIndex: number,
    @Req() req: AuthRequest,
  ) {
    const existing = await this.ds.query(
      `SELECT id FROM poll_votes WHERE poll_id = ? AND user_id = ?`,
      [pollId, req.user.id],
    );
    if (existing.length > 0) {
      // Atualiza o voto anterior
      await this.ds.query(
        `UPDATE poll_votes SET option_index = ? WHERE poll_id = ? AND user_id = ?`,
        [optionIndex, pollId, req.user.id],
      );
    } else {
      await this.ds.query(
        `INSERT INTO poll_votes (poll_id, user_id, option_index) VALUES (?, ?, ?)`,
        [pollId, req.user.id, optionIndex],
      );
    }
    return this.getPollResults(pollId);
  }

  // ── Verifica se o usuário é dono do organizer ─────────────────────────────────
  private async assertIsOrganizer(userId: number, organizerId: number) {
    const [org] = await this.ds.query(
      `SELECT id FROM organizers WHERE id = ? AND user_id = ?`,
      [organizerId, userId],
    );
    if (!org) {
      throw new UnauthorizedException('Você não tem permissão para esta ação');
    }
  }
}
