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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateEventToken,
  DeleteEventToken,
  FindAllEventsToken,
  FindEventByIdToken,
  UpdateEventToken,
} from './event.token';
import type IUsecase from 'src/common/interfaces/IUseCase';
import CreateEventUseCaseInputDto from './external/dto/create.event.usecase.input.dto';
import CreateEventUseCaseOutput from './usecase/dto/output/create.event.usecase.output';
import CreateEventUseCaseInput from './usecase/dto/input/create.event.usecase.input';
import FindEventByIdUseCaseInput from './usecase/dto/input/find.event.by.id.usecase.input';
import FindEventByIdUseCaseOutput from './usecase/dto/output/find.event.by.id.usecase.output';
import FindAllEventsUseCaseOutput from './usecase/dto/output/find.all.events.usecase.output';
import UpdateEventUseCaseInputDto from './external/dto/update.event.usecase.input.dto';
import UpdateEventUseCaseInput from './usecase/dto/input/update.event.usecase.input';
import UpdateEventUseCaseOutput from './usecase/dto/output/update.event.usecase.output';
import DeleteEventUseCaseInput from './usecase/dto/input/delete.event.usecase.input';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';

@Controller('/events')
export default class EventController {
  constructor(
    @Inject(CreateEventToken)
    private readonly createEvent: IUsecase<
      CreateEventUseCaseInput,
      CreateEventUseCaseOutput
    >,
    @Inject(FindEventByIdToken)
    private readonly findEventById: IUsecase<
      FindEventByIdUseCaseInput,
      FindEventByIdUseCaseOutput
    >,
    @Inject(FindAllEventsToken)
    private readonly findAllEvents: IUsecase<void, FindAllEventsUseCaseOutput>,
    @Inject(UpdateEventToken)
    private readonly updateEvent: IUsecase<
      UpdateEventUseCaseInput,
      UpdateEventUseCaseOutput
    >,
    @Inject(DeleteEventToken)
    private readonly deleteEvent: IUsecase<DeleteEventUseCaseInput, void>,
  ) {}

  private readonly logger = new Logger(EventController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async postEvent(
    @Body() input: CreateEventUseCaseInputDto,
  ): Promise<CreateEventUseCaseOutput> {
    try {
      this.logger.log(`POST /events/ body: ${JSON.stringify({ title: input.title })}`);
      const useCaseInput = new CreateEventUseCaseInput(input);
      return await this.createEvent.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchEvents(
    @Query('title') title?: string,
    @Query('category') category?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('isPublished') isPublished?: string,
  ): Promise<FindAllEventsUseCaseOutput> {
    try {
      this.logger.log(`GET /events/search title=${title} category=${category}`);
      const result = await this.findAllEvents.run();
      const filtered = result.events.filter((e) => {
        if (title && !e.title?.toLowerCase().includes(title.toLowerCase())) return false;
        if (category && e.category !== category) return false;
        if (city && !e.city?.toLowerCase().includes(city.toLowerCase())) return false;
        if (state && e.state?.toLowerCase() !== state.toLowerCase()) return false;
        if (isPublished === 'true' && !e.isPublished) return false;
        return true;
      });
      return { events: filtered };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllEvents(): Promise<FindAllEventsUseCaseOutput> {
    try {
      this.logger.log('GET /events/');
      return await this.findAllEvents.run();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getEventById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindEventByIdUseCaseOutput> {
    try {
      this.logger.log(`GET /events/${id}`);
      const useCaseInput = new FindEventByIdUseCaseInput(id);
      return await this.findEventById.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateEventById(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateEventUseCaseInputDto,
  ): Promise<UpdateEventUseCaseOutput> {
    try {
      this.logger.log(`PATCH /events/${id} body: ${JSON.stringify(input)}`);
      const useCaseInput = new UpdateEventUseCaseInput(id, input);
      return await this.updateEvent.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEventById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      this.logger.log(`DELETE /events/${id}`);
      const useCaseInput = new DeleteEventUseCaseInput(id);
      return await this.deleteEvent.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
