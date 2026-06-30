import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import User from 'src/users/domain/entity/User.entity';
import Organizer from 'src/organizers/domain/entity/Organizer.entity';
import Event from 'src/events/domain/entity/Event.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import Order from 'src/orders/domain/entity/Order.entity';
import OrderItem from 'src/orders/domain/entity/OrderItem.entity';
import EventPost from 'src/event-posts/domain/entity/EventPost.entity';
import { OrderStatus } from 'src/orders/domain/order-status.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Organizer)
    private readonly organizerRepo: Repository<Organizer>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(EventPost)
    private readonly eventPostRepo: Repository<EventPost>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) return;

    this.logger.log('🌱 Iniciando seed do banco de dados...');

    const users = await this.seedUsers();
    const organizer = await this.seedOrganizer(users.organizer);
    const events = await this.seedEvents(organizer.id);
    await this.seedTickets(events);
    await this.seedOrdersAndItems(users.cliente, events);
    await this.seedEventPosts(users.organizer, events);

    this.logger.log('✅ Seed concluído!');
  }

  private async seedUsers() {
    const usersData = [
      {
        name: 'Cliente Demo',
        email: 'cliente@demo.com',
        password: 'demo123',
        cpfCnpj: '000.000.000-00',
        role: 'participant' as const,
      },
      {
        name: 'Admin Ticketon',
        email: 'admin@ticketon.com.br',
        password: 'admin123',
        cpfCnpj: '111.111.111-11',
        role: 'admin' as const,
      },
      {
        name: 'João Organizador',
        email: 'organizador@demo.com',
        password: 'demo123',
        cpfCnpj: '222.222.222-22',
        role: 'organizer' as const,
      },
    ];

    const saved: User[] = [];
    for (const u of usersData) {
      const hash = await bcrypt.hash(u.password, 10);
      const user = this.userRepo.create({
        ...u,
        password: hash,
      });
      saved.push(await this.userRepo.save(user));
      this.logger.log(`👤 Usuário criado: ${u.email}`);
    }

    return { cliente: saved[0], admin: saved[1], organizer: saved[2] };
  }

  private async seedOrganizer(user: User) {
    const organizer = this.organizerRepo.create({
      userId: user.id,
      companyName: 'Ticketon Produções',
      cnpj: '12345678000199',
      phone: '(11) 99999-0000',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipcode: '01310100',
      description:
        'Empresa de produção de eventos culturais e musicais em todo Brasil.',
      website: 'https://ticketon.com.br',
      isVerified: true,
      isActive: true,
    });
    const saved = await this.organizerRepo.save(organizer);
    this.logger.log('🏢 Organizador criado');
    return saved;
  }

  private async seedEvents(organizerId: number) {
    const now = new Date();
    const future = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d;
    };
    const past = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d;
    };

    const eventsData = [
      {
        organizerId,
        title: 'Festival de Música Eletrônica SP',
        description:
          'O maior festival de música eletrônica do Brasil retorna a São Paulo com line-up internacional. DJs renomados de todo o mundo em uma experiência única de 12 horas.',
        category: 'music',
        eventDate: future(30),
        eventEndDate: future(31),
        locationType: 'presential',
        venueName: 'Allianz Parque',
        address: 'Av. Francisco Matarazzo, 1705',
        city: 'São Paulo',
        state: 'SP',
        zipcode: '05001200',
        bannerUrl:
          'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        maxAttendees: 5000,
        status: 'published',
        isPublic: true,
        isPublished: true,
        publishedAt: now,
      },
      {
        organizerId,
        title: 'Conferência de Tecnologia e Inovação 2026',
        description:
          'Dois dias de palestras, workshops e networking com os principais líderes de tecnologia do Brasil. Temas: IA, blockchain, startups e futuro do trabalho.',
        category: 'conference',
        eventDate: future(15),
        eventEndDate: future(16),
        locationType: 'presential',
        venueName: 'Centro de Convenções Rebouças',
        address: 'Av. Dr. Enéas de Carvalho Aguiar, 23',
        city: 'São Paulo',
        state: 'SP',
        zipcode: '05403000',
        bannerUrl:
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        maxAttendees: 800,
        status: 'published',
        isPublic: true,
        isPublished: true,
        publishedAt: now,
      },
      {
        organizerId,
        title: 'Workshop de Marketing Digital',
        description:
          'Aprenda as melhores estratégias de marketing digital com especialistas do mercado. Conteúdo prático sobre SEO, redes sociais, tráfego pago e muito mais.',
        category: 'workshop',
        eventDate: future(7),
        eventEndDate: null,
        locationType: 'online',
        venueName: null,
        address: null,
        city: null,
        state: null,
        zipcode: null,
        onlineUrl: 'https://meet.google.com/demo',
        bannerUrl:
          'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800',
        maxAttendees: 200,
        status: 'published',
        isPublic: true,
        isPublished: true,
        publishedAt: now,
      },
      {
        organizerId,
        title: 'Festa Junina Tradicional 2026',
        description:
          'A tradicional festa junina com forró ao vivo, comidas típicas, quadrilha e muita animação para toda família. Traje típico é bem-vindo!',
        category: 'party',
        eventDate: future(45),
        eventEndDate: null,
        locationType: 'presential',
        venueName: 'Espaço Verde Eventos',
        address: 'Rua das Acácias, 250',
        city: 'Campinas',
        state: 'SP',
        zipcode: '13010050',
        bannerUrl:
          'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800',
        maxAttendees: 1000,
        status: 'published',
        isPublic: true,
        isPublished: true,
        publishedAt: now,
      },
      {
        organizerId,
        title: 'Corrida Urbana 10K São Paulo',
        description:
          'Participe da maior corrida urbana de São Paulo! Percurso de 10km pelas ruas do centro histórico. Medalha e kit para todos os finishers.',
        category: 'sports',
        eventDate: future(60),
        eventEndDate: null,
        locationType: 'presential',
        venueName: 'Parque do Ibirapuera',
        address: 'Av. Pedro Álvares Cabral, s/n',
        city: 'São Paulo',
        state: 'SP',
        zipcode: '04094050',
        bannerUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        maxAttendees: 3000,
        status: 'published',
        isPublic: true,
        isPublished: true,
        publishedAt: now,
      },
      {
        organizerId,
        title: 'Show de Stand-up Comedy',
        description:
          'Uma noite imperdível de risos com os maiores comediantes do Brasil. Dois shows no mesmo dia, às 19h e às 22h. Classificação etária: 16 anos.',
        category: 'theater',
        eventDate: past(5),
        eventEndDate: null,
        locationType: 'presential',
        venueName: 'Teatro Opus',
        address: 'Av. das Nações Unidas, 11000',
        city: 'São Paulo',
        state: 'SP',
        zipcode: '04578000',
        bannerUrl:
          'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800',
        maxAttendees: 500,
        status: 'published',
        isPublic: true,
        isPublished: true,
        publishedAt: past(20),
      },
    ];

    const saved: Event[] = [];
    for (const e of eventsData) {
      const event = this.eventRepo.create(e);
      saved.push(await this.eventRepo.save(event));
    }
    this.logger.log(`🎭 ${saved.length} eventos criados`);
    return saved;
  }

  private async seedTickets(events: Event[]) {
    const ticketDefs = [
      [
        { name: 'Pista', price: 120, qty: 3000, type: 'paid', sold: 450 },
        { name: 'VIP', price: 280, qty: 500, type: 'paid', sold: 80 },
        { name: 'Camarote', price: 580, qty: 100, type: 'paid', sold: 15 },
      ],
      [
        {
          name: 'Ingresso Standard',
          price: 350,
          qty: 600,
          type: 'paid',
          sold: 210,
        },
        { name: 'Ingresso VIP', price: 650, qty: 150, type: 'paid', sold: 45 },
        { name: 'Early Bird', price: 199, qty: 50, type: 'paid', sold: 50 },
      ],
      [
        { name: 'Acesso Básico', price: 0, qty: 100, type: 'free', sold: 75 },
        { name: 'Acesso Premium', price: 89, qty: 50, type: 'paid', sold: 22 },
      ],
      [
        { name: 'Adulto', price: 45, qty: 800, type: 'paid', sold: 320 },
        { name: 'Criança', price: 20, qty: 200, type: 'paid', sold: 95 },
        {
          name: 'Família (4 pessoas)',
          price: 130,
          qty: 100,
          type: 'paid',
          sold: 40,
        },
      ],
      [
        {
          name: 'Inscrição Standard',
          price: 75,
          qty: 2500,
          type: 'paid',
          sold: 890,
        },
        {
          name: 'Inscrição + Kit Premium',
          price: 120,
          qty: 500,
          type: 'paid',
          sold: 180,
        },
      ],
      [
        { name: 'Plateia', price: 80, qty: 400, type: 'paid', sold: 395 },
        { name: 'VIP', price: 150, qty: 100, type: 'paid', sold: 100 },
      ],
    ];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const defs = ticketDefs[i] ?? [];
      for (const def of defs) {
        const ticket = this.ticketRepo.create({
          eventId: event.id,
          name: def.name,
          price: def.price,
          quantityAvailable: def.qty,
          quantitySold: def.sold,
          ticketType: def.type,
          isActive: true,
          minPerOrder: 1,
          maxPerOrder: 10,
        });
        await this.ticketRepo.save(ticket);
      }
    }
    this.logger.log('🎫 Ingressos criados');
  }

  private async seedOrdersAndItems(cliente: User, events: Event[]) {
    const ticketsEvent0 = await this.ticketRepo.find({
      where: { eventId: events[0].id },
    });
    const ticketsEvent1 = await this.ticketRepo.find({
      where: { eventId: events[5].id },
    });

    const orderDefs = [
      {
        event: events[0],
        ticket: ticketsEvent0[0],
        quantity: 2,
        status: OrderStatus.PAID,
        paymentMethod: 'credit_card',
      },
      {
        event: events[5],
        ticket: ticketsEvent1[0],
        quantity: 1,
        status: OrderStatus.PAID,
        paymentMethod: 'pix',
      },
    ];

    for (const def of orderDefs) {
      if (!def.ticket) continue;
      const unitPrice = Number(def.ticket.price);
      const totalAmount = unitPrice * def.quantity;

      const order = this.orderRepo.create({
        userId: cliente.id,
        eventId: def.event.id,
        status: def.status,
        totalAmount,
        paymentMethod: def.paymentMethod,
        customerName: cliente.name,
        customerEmail: cliente.email,
        customerPhone: '(11) 99000-0001',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      const savedOrder = await this.orderRepo.save(order);

      const qrCode = `QR-${savedOrder.id}-${def.ticket.id}-${Date.now()}`;
      const item = this.orderItemRepo.create({
        orderId: savedOrder.id,
        ticketId: def.ticket.id,
        quantity: def.quantity,
        unitPrice,
        totalPrice: totalAmount,
        qrCode,
        qrCodeData: JSON.stringify({
          orderId: savedOrder.id,
          ticketId: def.ticket.id,
          qrCode,
        }),
        isUsed: def.event.eventDate < new Date(),
        usedAt: def.event.eventDate < new Date() ? def.event.eventDate : null,
      });
      await this.orderItemRepo.save(item);
    }
    this.logger.log('🛒 Pedidos e itens criados');
  }

  private async seedEventPosts(organizer: User, events: Event[]) {
    const posts = [
      {
        event: events[0],
        content:
          '🎉 Line-up completo anunciado! Confirme já o seu ingresso antes que esgote.',
      },
      {
        event: events[0],
        content:
          '⚠️ Atenção: proibida a entrada de garrafinhas e guarda-chuvas. Confira o regulamento completo no site.',
      },
      {
        event: events[1],
        content:
          '📢 Palestra de abertura confirmada: "Inteligência Artificial e o Futuro do Trabalho" com especialistas do MIT e USP.',
      },
      {
        event: events[2],
        content:
          '💻 Material de apoio e o link de acesso serão enviados por e-mail 1 dia antes. Fique atento à sua caixa de entrada!',
      },
      {
        event: events[4],
        content:
          '🏃 Dica: chegue 30 minutos antes para retirar o kit e aquecer. A largada é pontual às 7h da manhã.',
      },
    ];

    for (const p of posts) {
      const post = this.eventPostRepo.create({
        eventId: p.event.id,
        userId: organizer.id,
        userName: organizer.name,
        content: p.content,
      });
      await this.eventPostRepo.save(post);
    }
    this.logger.log('📝 Posts de eventos criados');
  }
}
