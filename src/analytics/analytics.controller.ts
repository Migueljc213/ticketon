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

interface DemographicsData {
  genderBreakdown: Array<{ gender: string; count: number }>;
  ageGroups: Array<{ group: string; count: number }>;
  neighborhoodBreakdown: Array<{ neighborhood: string; count: number }>;
  totalWithData: number;
}

interface ConsumptionItem {
  itemName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface ConsumptionData {
  items: ConsumptionItem[];
  byCategory: Array<{ category: string; totalQuantity: number; totalRevenue: number }>;
  totalRevenue: number;
  totalItems: number;
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
  demographics: DemographicsData;
  consumption: ConsumptionData;
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

    // ── Dados Demográficos ─────────────────────────────────────────────────────
    const genderRaw = await this.ds.query<Array<{ gender: string; count: string }>>(
      `SELECT
         COALESCE(o.customer_gender, 'nao_informado') AS gender,
         COUNT(*) AS count
       FROM orders o
       WHERE o.event_id = ? AND o.status = 'paid' AND o.customer_gender IS NOT NULL
       GROUP BY o.customer_gender
       ORDER BY count DESC`,
      [eventId],
    );

    const ageRaw = await this.ds.query<Array<{ age: string; count: string }>>(
      `SELECT o.customer_age AS age, COUNT(*) AS count
       FROM orders o
       WHERE o.event_id = ? AND o.status = 'paid' AND o.customer_age IS NOT NULL
       GROUP BY o.customer_age
       ORDER BY o.customer_age ASC`,
      [eventId],
    );

    const neighborhoodRaw = await this.ds.query<Array<{ neighborhood: string; count: string }>>(
      `SELECT o.customer_neighborhood AS neighborhood, COUNT(*) AS count
       FROM orders o
       WHERE o.event_id = ? AND o.status = 'paid' AND o.customer_neighborhood IS NOT NULL
       GROUP BY o.customer_neighborhood
       ORDER BY count DESC
       LIMIT 10`,
      [eventId],
    );

    const [demographicsTotalRow] = await this.ds.query<Array<{ total: string }>>(
      `SELECT COUNT(*) AS total FROM orders o
       WHERE o.event_id = ? AND o.status = 'paid'
       AND (o.customer_gender IS NOT NULL OR o.customer_age IS NOT NULL OR o.customer_neighborhood IS NOT NULL)`,
      [eventId],
    );

    // Agrupa idades em faixas
    const ageGroupMap = new Map<string, number>();
    for (const r of ageRaw) {
      const age = Number(r.age);
      let group: string;
      if (age < 18) group = '<18';
      else if (age <= 24) group = '18-24';
      else if (age <= 34) group = '25-34';
      else if (age <= 44) group = '35-44';
      else if (age <= 54) group = '45-54';
      else group = '55+';
      ageGroupMap.set(group, (ageGroupMap.get(group) ?? 0) + Number(r.count));
    }
    const ageGroupOrder = ['<18', '18-24', '25-34', '35-44', '45-54', '55+'];
    const ageGroups = ageGroupOrder
      .filter((g) => ageGroupMap.has(g))
      .map((g) => ({ group: g, count: ageGroupMap.get(g)! }));

    const demographics: DemographicsData = {
      genderBreakdown: genderRaw.map((r) => ({ gender: r.gender, count: Number(r.count) })),
      ageGroups,
      neighborhoodBreakdown: neighborhoodRaw.map((r) => ({
        neighborhood: r.neighborhood,
        count: Number(r.count),
      })),
      totalWithData: Number(demographicsTotalRow?.total ?? 0),
    };

    // ── Dados de Consumo ───────────────────────────────────────────────────────
    const consumptionRaw = await this.ds.query<
      Array<{ itemName: string; category: string; totalQuantity: string; totalRevenue: string }>
    >(
      `SELECT
         item_name    AS itemName,
         category,
         SUM(quantity)    AS totalQuantity,
         SUM(total_amount) AS totalRevenue
       FROM event_consumption_records
       WHERE event_id = ?
       GROUP BY item_name, category
       ORDER BY totalQuantity DESC`,
      [eventId],
    );

    const consumptionByCategoryRaw = await this.ds.query<
      Array<{ category: string; totalQuantity: string; totalRevenue: string }>
    >(
      `SELECT
         category,
         SUM(quantity)     AS totalQuantity,
         SUM(total_amount) AS totalRevenue
       FROM event_consumption_records
       WHERE event_id = ?
       GROUP BY category
       ORDER BY totalQuantity DESC`,
      [eventId],
    );

    const [consumptionTotals] = await this.ds.query<Array<{ totalRevenue: string; totalItems: string }>>(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue, COALESCE(SUM(quantity), 0) AS totalItems
       FROM event_consumption_records WHERE event_id = ?`,
      [eventId],
    );

    const consumption: ConsumptionData = {
      items: consumptionRaw.map((r) => ({
        itemName: r.itemName,
        category: r.category,
        totalQuantity: Number(r.totalQuantity),
        totalRevenue: Number(r.totalRevenue),
      })),
      byCategory: consumptionByCategoryRaw.map((r) => ({
        category: r.category,
        totalQuantity: Number(r.totalQuantity),
        totalRevenue: Number(r.totalRevenue),
      })),
      totalRevenue: Number(consumptionTotals?.totalRevenue ?? 0),
      totalItems: Number(consumptionTotals?.totalItems ?? 0),
    };

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
      demographics,
      consumption,
    };
  }
}
