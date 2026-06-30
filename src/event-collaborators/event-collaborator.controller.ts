import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IsEmail, IsIn, IsOptional } from 'class-validator';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

class AddCollaboratorDto {
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @IsOptional()
  @IsIn(['SCANNER', 'CO_ORGANIZER'], {
    message: 'Papel inválido. Use SCANNER ou CO_ORGANIZER',
  })
  role?: string;
}

@Controller('event-collaborators')
@UseGuards(JwtAuthGuard)
export default class EventCollaboratorController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private async assertIsOrganizer(
    eventId: number,
    userId: number,
  ): Promise<void> {
    const [row] = await this.ds.query(
      `SELECT e.id FROM events e
       INNER JOIN organizers o ON o.id = e.organizer_id
       WHERE e.id = ? AND o.user_id = ?`,
      [eventId, userId],
    );
    if (!row)
      throw new ForbiddenException(
        'Somente o organizador do evento pode gerenciar a equipe.',
      );
  }

  @Get('my/assignments')
  @HttpCode(HttpStatus.OK)
  async myAssignments(@Req() req: AuthRequest) {
    return this.ds.query(
      `SELECT ec.id AS collaboratorId, ec.role, ec.event_id AS eventId,
              e.title AS eventTitle, e.event_date AS eventDate,
              e.venue_name AS venueName, e.city, e.state, e.banner_url AS bannerUrl,
              e.organizer_id AS organizerId
       FROM event_collaborators ec
       INNER JOIN events e ON e.id = ec.event_id
       WHERE ec.user_id = ?
       ORDER BY e.event_date ASC`,
      [req.user.id],
    );
  }

  @Get(':eventId')
  @HttpCode(HttpStatus.OK)
  async list(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(eventId, req.user.id);
    return this.ds.query(
      `SELECT ec.id, ec.event_id AS eventId, ec.user_id AS userId,
              ec.role, ec.created_at AS addedAt,
              u.name AS userName, u.email AS userEmail
       FROM event_collaborators ec
       INNER JOIN users u ON u.id = ec.user_id
       WHERE ec.event_id = ?
       ORDER BY ec.created_at DESC`,
      [eventId],
    );
  }

  @Post(':eventId')
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: AddCollaboratorDto,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(eventId, req.user.id);

    const [user] = await this.ds.query(
      `SELECT id, name, email FROM users WHERE email = ?`,
      [dto.email],
    );
    if (!user)
      throw new NotFoundException(
        `Nenhum usuário encontrado com o e-mail "${dto.email}".`,
      );

    const [existing] = await this.ds.query(
      `SELECT id FROM event_collaborators WHERE event_id = ? AND user_id = ?`,
      [eventId, user.id],
    );
    if (existing)
      throw new BadRequestException(
        `${user.name} já faz parte da equipe deste evento.`,
      );

    const role = dto.role ?? 'SCANNER';
    const result = await this.ds.query(
      `INSERT INTO event_collaborators (event_id, user_id, role) VALUES (?, ?, ?)`,
      [eventId, user.id, role],
    );

    return {
      id: result.insertId,
      eventId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role,
    };
  }

  @Delete(':eventId/:collaboratorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('collaboratorId', ParseIntPipe) collaboratorId: number,
    @Req() req: AuthRequest,
  ) {
    await this.assertIsOrganizer(eventId, req.user.id);
    const result = await this.ds.query(
      `DELETE FROM event_collaborators WHERE id = ? AND event_id = ?`,
      [collaboratorId, eventId],
    );
    if (result.affectedRows === 0)
      throw new NotFoundException('Colaborador não encontrado.');
  }
}
