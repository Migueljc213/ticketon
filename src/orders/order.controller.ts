import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  CreateOrderToken,
  FindOrdersByUserIdToken,
  FindOrderItemByQrCodeToken,
  CheckInOrderItemToken,
  GetCheckInDashboardToken,
  GetParticipantsListToken,
  GetPlatformRevenueToken,
} from './order.token';
import type IUsecase from 'src/common/interfaces/IUseCase';
import CreateOrderUseCaseInputDto from './external/dto/create.order.usecase.input.dto';
import CreateOrderUseCaseOutput from './usecase/dto/output/create.order.usecase.output';
import CreateOrderUseCaseInput from './usecase/dto/input/create.order.usecase.input';
import FindOrdersByUserIdUseCaseInput from './usecase/dto/input/find.orders.by.user.id.usecase.input';
import FindOrdersByUserIdUseCaseOutput from './usecase/dto/output/find.orders.by.user.id.usecase.output';
import FindOrderItemByQrCodeUseCaseInput from './usecase/dto/input/find.order.item.by.qr.code.usecase.input';
import FindOrderItemByQrCodeUseCaseOutput from './usecase/dto/output/find.order.item.by.qr.code.usecase.output';
import CheckInOrderItemUseCaseInput from './usecase/dto/input/check.in.order.item.usecase.input';
import CheckInOrderItemUseCaseOutput from './usecase/dto/output/check.in.order.item.usecase.output';
import GetCheckInDashboardUseCaseInput from './usecase/dto/input/get.checkin.dashboard.usecase.input';
import GetCheckInDashboardUseCaseOutput from './usecase/dto/output/get.checkin.dashboard.usecase.output';
import GetParticipantsListUseCaseInput from './usecase/dto/input/get.participants.list.usecase.input';
import GetParticipantsListUseCaseOutput from './usecase/dto/output/get.participants.list.usecase.output';
import GetPlatformRevenueUseCaseOutput from './usecase/dto/output/get.platform.revenue.usecase.output';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';

@Controller('/orders')
export default class OrderController {
  constructor(
    @Inject(CreateOrderToken)
    private readonly createOrder: IUsecase<
      CreateOrderUseCaseInput,
      CreateOrderUseCaseOutput
    >,
    @Inject(FindOrdersByUserIdToken)
    private readonly findOrdersByUserId: IUsecase<
      FindOrdersByUserIdUseCaseInput,
      FindOrdersByUserIdUseCaseOutput
    >,
    @Inject(FindOrderItemByQrCodeToken)
    private readonly findOrderItemByQrCode: IUsecase<
      FindOrderItemByQrCodeUseCaseInput,
      FindOrderItemByQrCodeUseCaseOutput
    >,
    @Inject(CheckInOrderItemToken)
    private readonly checkInOrderItem: IUsecase<
      CheckInOrderItemUseCaseInput,
      CheckInOrderItemUseCaseOutput
    >,
    @Inject(GetCheckInDashboardToken)
    private readonly getCheckInDashboard: IUsecase<
      GetCheckInDashboardUseCaseInput,
      GetCheckInDashboardUseCaseOutput
    >,
    @Inject(GetParticipantsListToken)
    private readonly getParticipantsList: IUsecase<
      GetParticipantsListUseCaseInput,
      GetParticipantsListUseCaseOutput
    >,
    @Inject(GetPlatformRevenueToken)
    private readonly getPlatformRevenue: IUsecase<
      void,
      GetPlatformRevenueUseCaseOutput
    >,
  ) {}

  private readonly logger = new Logger(OrderController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async postOrder(
    @Body() input: CreateOrderUseCaseInputDto,
  ): Promise<CreateOrderUseCaseOutput> {
    try {
      this.logger.log(
        `POST /orders/ body: ${JSON.stringify({ eventId: input.eventId })}`,
      );
      const useCaseInput = new CreateOrderUseCaseInput(input);
      return await this.createOrder.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getOrdersByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<FindOrdersByUserIdUseCaseOutput> {
    try {
      this.logger.log(`GET /orders/user/${userId}`);
      const useCaseInput = new FindOrdersByUserIdUseCaseInput(userId);
      return await this.findOrdersByUserId.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('qr-code/:qrCode')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getOrderItemByQrCode(
    @Param('qrCode') qrCode: string,
  ): Promise<FindOrderItemByQrCodeUseCaseOutput> {
    try {
      this.logger.log(`GET /orders/qr-code/${qrCode}`);
      const useCaseInput = new FindOrderItemByQrCodeUseCaseInput(qrCode);
      return await this.findOrderItemByQrCode.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async checkIn(
    @Body() body: { qrCode: string; checkedInBy: number },
  ): Promise<CheckInOrderItemUseCaseOutput> {
    try {
      this.logger.log(`POST /orders/check-in qrCode: ${body.qrCode}`);
      const useCaseInput = new CheckInOrderItemUseCaseInput(
        body.qrCode,
        body.checkedInBy,
      );
      return await this.checkInOrderItem.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('dashboard/event/:eventId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDashboard(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<GetCheckInDashboardUseCaseOutput> {
    try {
      this.logger.log(`GET /orders/dashboard/event/${eventId}`);
      const useCaseInput = new GetCheckInDashboardUseCaseInput(eventId);
      return await this.getCheckInDashboard.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('participants/event/:eventId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getParticipants(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query('export') exportFormat?: string,
    @Res() res?: Response,
  ): Promise<GetParticipantsListUseCaseOutput | any> {
    try {
      this.logger.log(`GET /orders/participants/event/${eventId}`);
      const useCaseInput = new GetParticipantsListUseCaseInput(eventId);
      const result = await this.getParticipantsList.run(useCaseInput);

      if (exportFormat === 'csv' && res) {
        const csv = this.convertToCSV(result.participants);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=participants-event-${eventId}.csv`,
        );
        return res.send(csv);
      }

      return result;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  private convertToCSV(participants: any[]): string {
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Ingresso',
      'Preço',
      'QR Code',
      'Check-in Realizado',
      'Data Check-in',
      'Data Compra',
    ];

    const rows = participants.map((p) => [
      p.customerName,
      p.customerEmail,
      p.customerPhone || '',
      p.ticketName,
      p.ticketPrice.toString(),
      p.qrCode,
      p.isCheckedIn ? 'Sim' : 'Não',
      p.checkedInAt ? new Date(p.checkedInAt).toLocaleString('pt-BR') : '',
      new Date(p.purchasedAt).toLocaleString('pt-BR'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    return csvContent;
  }

  @Get('platform/revenue')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPlatformRevenueData(): Promise<GetPlatformRevenueUseCaseOutput> {
    try {
      this.logger.log('GET /orders/platform/revenue');
      return await this.getPlatformRevenue.run();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}

