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
  SearchEventsToken,
  CreateEventPostToken,
  FindEventPostsByEventIdToken,
} from './event.token';
import type IUsecase from 'src/common/interfaces/IUseCase';
import CreateEventUseCaseInputDto from './external/dto/create.event.usecase.input.dto';
import CreateEventUseCaseOutput from './usecase/dto/output/create.event.usecase.output';
import CreateEventUseCaseInput from './usecase/dto/input/create.event.usecase.input';
import FindEventByIdUseCaseInput from './usecase/dto/input/find.event.by.id.usecase.input';
import FindEventByIdUseCaseOutput from './usecase/dto/output/find.event.by.id.usecase.output';
import FindAllEventsUseCaseOutput from './usecase/dto/output/find.all.events.usecase.output';
import UpdateEventUseCaseInputDto from './external/dto/update.event.usecase.input.dto';
import SearchEventsUseCaseInput from './usecase/dto/input/search.events.usecase.input';
import SearchEventsUseCaseOutput from './usecase/dto/output/search.events.usecase.output';
import CreateEventPostUseCaseInputDto from './external/dto/create.event.post.usecase.input.dto';
import CreateEventPostUseCaseInput from './usecase/dto/input/create.event.post.usecase.input';
import CreateEventPostUseCaseOutput from './usecase/dto/output/create.event.post.usecase.output';
import FindEventPostsByEventIdUseCaseInput from './usecase/dto/input/find.event.posts.by.event.id.usecase.input';
import FindEventPostsByEventIdUseCaseOutput from './usecase/dto/output/find.event.posts.by.event.id.usecase.output';
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
    @Inject(SearchEventsToken)
    private readonly searchEventsUseCase: IUsecase<
      SearchEventsUseCaseInput,
      SearchEventsUseCaseOutput
    >,
    @Inject(CreateEventPostToken)
    private readonly createEventPostUseCase: IUsecase<
      CreateEventPostUseCaseInput,
      CreateEventPostUseCaseOutput
    >,
    @Inject(FindEventPostsByEventIdToken)
    private readonly findEventPostsByEventId: IUsecase<
      FindEventPostsByEventIdUseCaseInput,
      FindEventPostsByEventIdUseCaseOutput
    >,
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
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('isPublished') isPublished?: string,
  ): Promise<SearchEventsUseCaseOutput> {
    try {
      this.logger.log('GET /events/search');
      const useCaseInput = new SearchEventsUseCaseInput({
        title,
        category,
        city,
        state,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isPublished: isPublished ? isPublished === 'true' : undefined,
      });
      return await this.searchEventsUseCase.run(useCaseInput);
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

  @Post(':eventId/posts')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createEventPost(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() input: CreateEventPostUseCaseInputDto,
  ): Promise<CreateEventPostUseCaseOutput> {
    try {
      this.logger.log(`POST /events/${eventId}/posts`);
      const useCaseInput = new CreateEventPostUseCaseInput({
        ...input,
        eventId,
      });
      return await this.createEventPostUseCase.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':eventId/posts')
  @HttpCode(HttpStatus.OK)
  async getEventPosts(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<FindEventPostsByEventIdUseCaseOutput> {
    try {
      this.logger.log(`GET /events/${eventId}/posts`);
      const useCaseInput = new FindEventPostsByEventIdUseCaseInput(eventId);
      return await this.findEventPostsByEventId.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
