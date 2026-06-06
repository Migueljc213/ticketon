import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreateTicketToken,
  DeleteTicketToken,
  FindAllTicketsToken,
  FindTicketByIdToken,
  TicketRepositoryToken,
  UpdateTicketToken,
} from './ticket.token';
import type ITicketRepository from './domain/interface/ticket.repository.interface';
import type IUsecase from 'src/common/interfaces/IUseCase';
import CreateTicketUseCaseInputDto from './external/dto/create.ticket.usecase.input.dto';
import CreateTicketUseCaseOutput from './usecase/dto/output/create.ticket.usecase.output';
import CreateTicketUseCaseInput from './usecase/dto/input/create.ticket.usecase.input';
import FindTicketByIdUseCaseInput from './usecase/dto/input/find.ticket.by.id.usecase.input';
import FindTicketByIdUseCaseOutput from './usecase/dto/output/find.ticket.by.id.usecase.output';
import FindAllTicketsUseCaseOutput from './usecase/dto/output/find.all.tickets.usecase.output';
import UpdateTicketUseCaseInputDto from './external/dto/update.ticket.usecase.input.dto';
import UpdateTicketUseCaseInput from './usecase/dto/input/update.ticket.usecase.input';
import UpdateTicketUseCaseOutput from './usecase/dto/output/update.ticket.usecase.output';
import DeleteTicketUseCaseInput from './usecase/dto/input/delete.ticket.usecase.input';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';

@Controller('/tickets')
export default class TicketController {
  constructor(
    @Inject(CreateTicketToken)
    private readonly createTicket: IUsecase<
      CreateTicketUseCaseInput,
      CreateTicketUseCaseOutput
    >,
    @Inject(FindTicketByIdToken)
    private readonly findTicketById: IUsecase<
      FindTicketByIdUseCaseInput,
      FindTicketByIdUseCaseOutput
    >,
    @Inject(FindAllTicketsToken)
    private readonly findAllTickets: IUsecase<
      void,
      FindAllTicketsUseCaseOutput
    >,
    @Inject(UpdateTicketToken)
    private readonly updateTicket: IUsecase<
      UpdateTicketUseCaseInput,
      UpdateTicketUseCaseOutput
    >,
    @Inject(DeleteTicketToken)
    private readonly deleteTicket: IUsecase<DeleteTicketUseCaseInput, void>,
    @Inject(TicketRepositoryToken)
    private readonly ticketRepo: ITicketRepository,
  ) {}

  private readonly logger = new Logger(TicketController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async postTicket(
    @Body() input: CreateTicketUseCaseInputDto,
  ): Promise<CreateTicketUseCaseOutput> {
    try {
      this.logger.log(
        `POST /tickets/ body: ${JSON.stringify({ name: input.name })}`,
      );
      const useCaseInput = new CreateTicketUseCaseInput(input);
      return await this.createTicket.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('event/:eventId')
  @HttpCode(HttpStatus.OK)
  async getTicketsByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<object> {
    this.logger.log(`GET /tickets/event/${eventId}`);
    return this.ticketRepo.findByEventId(eventId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTickets(): Promise<FindAllTicketsUseCaseOutput> {
    try {
      this.logger.log('GET /tickets/');
      return await this.findAllTickets.run();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTicketById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindTicketByIdUseCaseOutput> {
    try {
      this.logger.log(`GET /tickets/${id}`);
      const useCaseInput = new FindTicketByIdUseCaseInput(id);
      return await this.findTicketById.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateTicketById(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateTicketUseCaseInputDto,
  ): Promise<UpdateTicketUseCaseOutput> {
    try {
      this.logger.log(`PATCH /tickets/${id} body: ${JSON.stringify(input)}`);
      const useCaseInput = new UpdateTicketUseCaseInput(id, input);
      return await this.updateTicket.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTicketById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      this.logger.log(`DELETE /tickets/${id}`);
      const useCaseInput = new DeleteTicketUseCaseInput(id);
      return await this.deleteTicket.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
