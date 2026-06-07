import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';

interface MonthBucket {
  month: string;
  count?: number;
  orders?: number;
  revenue?: number;
}

interface PlatformAnalyticsResponse {
  totalUsers: number;
  totalOrganizers: number;
  totalParticipants: number;
  newUsersThisMonth: number;
  totalEvents: number;
  publishedEvents: number;
  eventsThisMonth: number;
  totalRevenue: number;
  totalOrders: number;
  revenueThisMonth: number;
  totalTicketsSold: number;
  averageTicketPrice: number;
  monthlySales: Array<{ month: string; orders: number; revenue: number }>;
  monthlyUsers: Array<{ month: string; count: number }>;
}

interface HourlyBucket {
  hour: number;
  count: number;
}

interface TicketBreakdown {
  ticketId: number;
  name: string;
  ticketType: string;
  price: number;
  sold: number;
  checkedIn: number;
}

interface AnalyticsResponse {
  eventId: number;
  revenue: number;
  totalOrders: number;
  ticketsSold: number;
  checkedIn: number;
  noShow: number;
  checkInRate: number;
  noShowRate: number;
  dailySales: Array<{ date: string; count: number; revenue: number }>;
  hourlyCheckin: HourlyBucket[];
  ticketBreakdown: TicketBreakdown[];
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export default class AnalyticsController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  @Get('platform')
  @HttpCode(HttpStatus.OK)
  async getPlatformAnalytics(): Promise<PlatformAnalyticsResponse> {
    const [usersRow] = await this.ds.query<Array<Record<string, string>>>(`
      SELECT
        COUNT(*)                                                                                         AS totalUsers,
        SUM(IF(role = 'organizer', 1, 0))                                                               AS totalOrganizers,
        SUM(IF(role = 'participant', 1, 0))                                                             AS totalParticipants,
        SUM(IF(MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()), 1, 0))             AS newUsersThisMonth
      FROM users
    `);

    const [eventsRow] = await this.ds.query<Array<Record<string, string>>>(`
      SELECT
        COUNT(*)                                                                                         AS totalEvents,
        SUM(IF(is_published = 1, 1, 0))                                                                 AS publishedEvents,
        SUM(IF(MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()), 1, 0))             AS eventsThisMonth
      FROM events
    `);

    const [revenueRow] = await this.ds.query<Array<Record<string, string>>>(`
      SELECT
        COALESCE(SUM(total_amount), 0)                                                                                   AS totalRevenue,
        COUNT(*)                                                                                                          AS totalOrders,
        COALESCE(SUM(IF(MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()), total_amount, 0)), 0)      AS revenueThisMonth
      FROM orders
      WHERE status = 'paid'
    `);

    const [ticketsRow] = await this.ds.query<Array<Record<string, string>>>(`
      SELECT COUNT(*) AS totalTicketsSold
      FROM purchased_tickets pt
      INNER JOIN orders o ON o.id = pt.order_id
      WHERE o.status = 'paid'
    `);

    const monthlySalesRaw = await this.ds.query<Array<Record<string, string>>>(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*)                          AS orders,
        COALESCE(SUM(total_amount), 0)   AS revenue
      FROM orders
      WHERE status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    const monthlyUsersRaw = await this.ds.query<Array<Record<string, string>>>(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*)                          AS count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    const totalRevenue = Number(revenueRow.totalRevenue ?? 0);
    const totalTicketsSold = Number(ticketsRow.totalTicketsSold ?? 0);

    return {
      totalUsers: Number(usersRow.totalUsers ?? 0),
      totalOrganizers: Number(usersRow.totalOrganizers ?? 0),
      totalParticipants: Number(usersRow.totalParticipants ?? 0),
      newUsersThisMonth: Number(usersRow.newUsersThisMonth ?? 0),
      totalEvents: Number(eventsRow.totalEvents ?? 0),
      publishedEvents: Number(eventsRow.publishedEvents ?? 0),
      eventsThisMonth: Number(eventsRow.eventsThisMonth ?? 0),
      totalRevenue,
      totalOrders: Number(revenueRow.totalOrders ?? 0),
      revenueThisMonth: Number(revenueRow.revenueThisMonth ?? 0),
      totalTicketsSold,
      averageTicketPrice:
        totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0,
      monthlySales: monthlySalesRaw.map((r) => ({
        month: r.month,
        orders: Number(r.orders),
        revenue: Number(r.revenue),
      })),
      monthlyUsers: monthlyUsersRaw.map((r) => ({
        month: r.month,
        count: Number(r.count),
      })),
    };
  }

  @Get('event/:eventId')
  @HttpCode(HttpStatus.OK)
  async getEventAnalytics(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<AnalyticsResponse> {
    // ── Receita e pedidos pagos ────────────────────────────────────────────────
    const [revenueRow] = await this.ds.query<
      Array<{ revenue: string; totalOrders: string }>
    >(
      `SELECT
         COALESCE(SUM(o.total_amount), 0) AS revenue,
         COUNT(*)                         AS totalOrders
       FROM orders o
       WHERE o.event_id = ? AND o.status = 'paid'`,
      [eventId],
    );

    // ── Ingressos emitidos (purchased_tickets) ─────────────────────────────────
    const [ticketsRow] = await this.ds.query<
      Array<{ sold: string; checkedIn: string }>
    >(
      `SELECT
         COUNT(*)                                           AS sold,
         SUM(IF(pt.status = 'used', 1, 0))                AS checkedIn
       FROM purchased_tickets pt
       INNER JOIN orders o ON o.id = pt.order_id
       WHERE o.event_id = ? AND o.status = 'paid'`,
      [eventId],
    );

    const sold = Number(ticketsRow.sold ?? 0);
    const checkedIn = Number(ticketsRow.checkedIn ?? 0);
    const noShow = sold - checkedIn;

    // ── Vendas diárias ─────────────────────────────────────────────────────────
    const dailySales = await this.ds.query<
      Array<{ date: string; count: string; revenue: string }>
    >(
      `SELECT
         DATE(o.created_at)           AS date,
         COUNT(*)                     AS count,
         COALESCE(SUM(o.total_amount), 0) AS revenue
       FROM orders o
       WHERE o.event_id = ? AND o.status = 'paid'
       GROUP BY DATE(o.created_at)
       ORDER BY date ASC`,
      [eventId],
    );

    // ── Curva horária de check-in ──────────────────────────────────────────────
    const hourlyRaw = await this.ds.query<
      Array<{ hour: string; count: string }>
    >(
      `SELECT
         HOUR(pt.used_at) AS hour,
         COUNT(*)         AS count
       FROM purchased_tickets pt
       INNER JOIN orders o ON o.id = pt.order_id
       WHERE o.event_id = ? AND pt.status = 'used' AND pt.used_at IS NOT NULL
       GROUP BY HOUR(pt.used_at)
       ORDER BY hour ASC`,
      [eventId],
    );

    // Preenche todos os horários com 0 mesmo os sem check-in
    const hourlyMap = new Map<number, number>();
    hourlyRaw.forEach((r) => hourlyMap.set(Number(r.hour), Number(r.count)));
    const hourlyCheckin: HourlyBucket[] = Array.from(
      { length: 24 },
      (_, h) => ({
        hour: h,
        count: hourlyMap.get(h) ?? 0,
      }),
    ).filter((_, h) => {
      // Retorna apenas horas com atividade + 1h antes e depois
      const active = hourlyRaw.map((r) => Number(r.hour));
      if (active.length === 0) return false;
      const min = Math.max(0, Math.min(...active) - 1);
      const max = Math.min(23, Math.max(...active) + 1);
      return h >= min && h <= max;
    });

    // ── Breakdown por lote ─────────────────────────────────────────────────────
    const ticketBreakdown = await this.ds.query<
      Array<{
        ticketId: string;
        name: string;
        ticketType: string;
        price: string;
        sold: string;
        checkedIn: string;
      }>
    >(
      `SELECT
         t.id          AS ticketId,
         t.name,
         t.ticket_type AS ticketType,
         t.price,
         COUNT(pt.id)                           AS sold,
         SUM(IF(pt.status = 'used', 1, 0))     AS checkedIn
       FROM tickets t
       LEFT JOIN purchased_tickets pt ON pt.ticket_id = t.id
       LEFT JOIN orders o ON o.id = pt.order_id AND o.status = 'paid'
       WHERE t.event_id = ?
       GROUP BY t.id, t.name, t.ticket_type, t.price
       ORDER BY t.id ASC`,
      [eventId],
    );

    return {
      eventId,
      revenue: Number(revenueRow.revenue ?? 0),
      totalOrders: Number(revenueRow.totalOrders ?? 0),
      ticketsSold: sold,
      checkedIn,
      noShow,
      checkInRate: sold > 0 ? Math.round((checkedIn / sold) * 100) : 0,
      noShowRate: sold > 0 ? Math.round((noShow / sold) * 100) : 0,
      dailySales: dailySales.map((r) => ({
        date: r.date,
        count: Number(r.count),
        revenue: Number(r.revenue),
      })),
      hourlyCheckin: hourlyCheckin.length > 0 ? hourlyCheckin : [],
      ticketBreakdown: ticketBreakdown.map((r) => ({
        ticketId: Number(r.ticketId),
        name: r.name,
        ticketType: r.ticketType,
        price: Number(r.price),
        sold: Number(r.sold),
        checkedIn: Number(r.checkedIn),
      })),
    };
  }
}
