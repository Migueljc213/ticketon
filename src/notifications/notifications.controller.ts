import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Request } from 'express';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: number; email: string };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export default class NotificationsController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  // ── Notificações do usuário + upcoming events dinâmicos ──────────────────────
  @Get('my')
  @HttpCode(HttpStatus.OK)
  async myNotifications(@Req() req: AuthRequest) {
    const userId = req.user.id;

    // Notificações persistidas
    const stored: Array<{
      id: number;
      type: string;
      title: string;
      body: string;
      read: boolean;
      createdAt: string;
      eventId: number | null;
    }> = await this.ds.query(
      `SELECT id, type, title, body, \`read\`, created_at AS createdAt, event_id AS eventId
       FROM user_notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId],
    );

    // Eventos nas próximas 24h que o usuário tem ingressos válidos
    const upcoming: Array<{
      eventId: number;
      title: string;
      eventDate: string;
      venueName: string;
    }> = await this.ds.query(
      `SELECT DISTINCT e.id AS eventId, e.title, e.event_date AS eventDate, e.venue_name AS venueName
         FROM events e
         INNER JOIN tickets t ON t.event_id = e.id
         INNER JOIN purchased_tickets pt ON pt.ticket_id = t.id AND pt.user_id = ? AND pt.status = 'valid'
         WHERE e.event_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)`,
      [userId],
    );

    // Cria notificações de "evento amanhã" se ainda não existirem
    for (const ev of upcoming) {
      const [exists] = await this.ds.query(
        `SELECT id FROM user_notifications
         WHERE user_id = ? AND type = 'upcoming_event' AND event_id = ?
           AND created_at > DATE_SUB(NOW(), INTERVAL 2 DAY)`,
        [userId, ev.eventId],
      );
      if (!exists) {
        const eventDate = new Date(ev.eventDate).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        await this.ds.query(
          `INSERT INTO user_notifications (user_id, type, title, body, event_id)
           VALUES (?, 'upcoming_event', ?, ?, ?)`,
          [
            userId,
            `🎉 ${ev.title} é amanhã!`,
            `Seu evento começa em ${eventDate}${ev.venueName ? ' em ' + ev.venueName : ''}. Não esqueça o ingresso!`,
            ev.eventId,
          ],
        );
      }
    }

    // Re-busca para incluir as novas
    const all = await this.ds.query(
      `SELECT id, type, title, body, \`read\`, created_at AS createdAt, event_id AS eventId
       FROM user_notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId],
    );

    return all.map((n: any) => ({
      ...n,
      read: Boolean(n.read),
    }));
  }

  // ── Marcar todas como lidas (deve vir ANTES de :id/read para evitar colisão) ──
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllRead(@Req() req: AuthRequest) {
    await this.ds.query(
      `UPDATE user_notifications SET \`read\` = 1 WHERE user_id = ? AND \`read\` = 0`,
      [req.user.id],
    );
    return { ok: true };
  }

  // ── Marcar uma como lida ─────────────────────────────────────────────────────
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    const result = await this.ds.query(
      `UPDATE user_notifications SET \`read\` = 1 WHERE id = ? AND user_id = ?`,
      [id, req.user.id],
    );
    if (result.affectedRows === 0)
      throw new NotFoundException('Notificação não encontrada.');
    return { ok: true };
  }
}
