import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';

export interface TicketEmailData {
  buyerName: string;
  buyerEmail: string;
  eventTitle: string;
  eventDate: string;
  venueName: string | null;
  city: string | null;
  tickets: Array<{
    name: string;
    qrCode: string;
    price: number;
    ticketType: string;
  }>;
  appUrl: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('MAIL_HOST');
    const user = config.get<string>('MAIL_USER');
    const pass = config.get<string>('MAIL_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(config.get('MAIL_PORT') ?? 587),
        secure: config.get('MAIL_SECURE') === 'true',
        auth: { user, pass },
      });
      this.logger.log('Mailer configured.');
    } else {
      this.logger.warn(
        'MAIL_HOST/MAIL_USER/MAIL_PASS not set — emails disabled.',
      );
    }
  }

  async sendTicketConfirmation(data: TicketEmailData): Promise<void> {
    if (!this.transporter) return;

    const from = this.config.get<string>('MAIL_FROM') ?? 'noreply@ticketon.com';
    const appUrl = data.appUrl || 'http://localhost:3002';

    // Gera QR codes como base64 PNG para cada ingresso
    const ticketBlocks = await Promise.all(
      data.tickets.map(async (t) => {
        const qrDataUrl = await QRCode.toDataURL(t.qrCode, {
          width: 200,
          margin: 2,
        });
        const ticketLink = `${appUrl}/tickets`;
        const price =
          t.ticketType === 'free'
            ? 'Gratuito'
            : new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(t.price);

        return `
          <div style="border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px;text-align:center;background:#fafffe;">
            <p style="font-weight:700;font-size:1rem;color:#003B4A;margin:0 0 4px;">${t.name}</p>
            <p style="color:#64748b;font-size:0.85rem;margin:0 0 12px;">${price}</p>
            <img src="${qrDataUrl}" alt="QR Code" style="width:180px;height:180px;display:block;margin:0 auto 12px;" />
            <p style="font-size:0.7rem;color:#94a3b8;font-family:monospace;word-break:break-all;margin:0 0 12px;">${t.qrCode}</p>
            <a href="${ticketLink}" style="display:inline-block;background:#00C2A8;color:#fff;padding:10px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.875rem;">
              Ver meu ingresso →
            </a>
          </div>
        `;
      }),
    );

    const eventDate = new Date(data.eventDate).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#003B4A,#00C2A8);padding:32px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.7);font-size:0.85rem;margin:0 0 8px;letter-spacing:0.1em;text-transform:uppercase;">Ticketon</p>
            <h1 style="color:#fff;margin:0;font-size:1.6rem;font-weight:800;">✅ Compra Confirmada!</h1>
          </div>

          <!-- Body -->
          <div style="padding:32px 40px;">
            <p style="color:#0f172a;font-size:1rem;margin:0 0 8px;">Olá, <strong>${data.buyerName}</strong>!</p>
            <p style="color:#64748b;font-size:0.9rem;margin:0 0 24px;line-height:1.6;">
              Seu(s) ingresso(s) para <strong>${data.eventTitle}</strong> foram confirmados. Guarde o QR code abaixo para apresentar na entrada do evento.
            </p>

            <!-- Event Info -->
            <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-weight:700;color:#003B4A;font-size:0.95rem;">📅 ${data.eventTitle}</p>
              <p style="margin:0 0 4px;color:#64748b;font-size:0.85rem;">${eventDate}</p>
              ${data.venueName ? `<p style="margin:0;color:#64748b;font-size:0.85rem;">📍 ${data.venueName}${data.city ? ', ' + data.city : ''}</p>` : ''}
            </div>

            <!-- Tickets -->
            <h2 style="font-size:1rem;font-weight:700;color:#0f172a;margin:0 0 16px;">Seus ingressos</h2>
            ${ticketBlocks.join('')}

            <p style="color:#94a3b8;font-size:0.78rem;text-align:center;margin-top:24px;line-height:1.5;">
              Apresente o QR code na entrada do evento.<br/>
              Em caso de dúvidas, acesse <a href="${appUrl}" style="color:#00C2A8;">${appUrl}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
            <p style="color:#94a3b8;font-size:0.75rem;margin:0;">
              © ${new Date().getFullYear()} Ticketon — Plataforma de Eventos
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Ticketon" <${from}>`,
        to: data.buyerEmail,
        subject: `✅ Ingresso confirmado — ${data.eventTitle}`,
        html,
      });
      this.logger.log(`Confirmation email sent to ${data.buyerEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${data.buyerEmail}:`, err);
    }
  }
}
