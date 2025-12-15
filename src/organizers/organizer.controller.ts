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
  CreateOrganizerToken,
  DeleteOrganizerToken,
  FindAllOrganizersToken,
  FindOrganizerByIdToken,
  UpdateOrganizerToken,
} from './organizer.token';
import type IUsecase from 'src/common/interfaces/IUseCase';
import CreateOrganizerUseCaseInputDto from './external/dto/create.organizer.usecase.input.dto';
import CreateOrganizerUseCaseOutput from './usecase/dto/output/create.organizer.usecase.output';
import CreateOrganizerUseCaseInput from './usecase/dto/input/create.organizer.usecase.input';
import FindOrganizerByIdUseCaseInput from './usecase/dto/input/find.organizer.by.id.usecase.input';
import FindOrganizerByIdUseCaseOutput from './usecase/dto/output/find.organizer.by.id.usecase.output';
import FindAllOrganizersUseCaseOutput from './usecase/dto/output/find.all.organizers.usecase.output';
import UpdateOrganizerUseCaseInputDto from './external/dto/update.organizer.usecase.input.dto';
import UpdateOrganizerUseCaseInput from './usecase/dto/input/update.organizer.usecase.input';
import UpdateOrganizerUseCaseOutput from './usecase/dto/output/update.organizer.usecase.output';
import DeleteOrganizerUseCaseInput from './usecase/dto/input/delete.organizer.usecase.input';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';

@Controller('/organizers')
export default class OrganizerController {
  constructor(
    @Inject(CreateOrganizerToken)
    private readonly createOrganizer: IUsecase<
      CreateOrganizerUseCaseInput,
      CreateOrganizerUseCaseOutput
    >,
    @Inject(FindOrganizerByIdToken)
    private readonly findOrganizerById: IUsecase<
      FindOrganizerByIdUseCaseInput,
      FindOrganizerByIdUseCaseOutput
    >,
    @Inject(FindAllOrganizersToken)
    private readonly findAllOrganizers: IUsecase<
      void,
      FindAllOrganizersUseCaseOutput
    >,
    @Inject(UpdateOrganizerToken)
    private readonly updateOrganizer: IUsecase<
      UpdateOrganizerUseCaseInput,
      UpdateOrganizerUseCaseOutput
    >,
    @Inject(DeleteOrganizerToken)
    private readonly deleteOrganizer: IUsecase<DeleteOrganizerUseCaseInput, void>,
  ) {}

  private readonly logger = new Logger(OrganizerController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async postOrganizer(
    @Body() input: CreateOrganizerUseCaseInputDto,
  ): Promise<CreateOrganizerUseCaseOutput> {
    try {
      this.logger.log(`POST /organizers/ body: ${JSON.stringify({ companyName: input.companyName })}`);
      const useCaseInput = new CreateOrganizerUseCaseInput(input);
      return await this.createOrganizer.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllOrganizers(): Promise<FindAllOrganizersUseCaseOutput> {
    try {
      this.logger.log('GET /organizers/');
      return await this.findAllOrganizers.run();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOrganizerById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindOrganizerByIdUseCaseOutput> {
    try {
      this.logger.log(`GET /organizers/${id}`);
      const useCaseInput = new FindOrganizerByIdUseCaseInput(id);
      return await this.findOrganizerById.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateOrganizerById(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateOrganizerUseCaseInputDto,
  ): Promise<UpdateOrganizerUseCaseOutput> {
    try {
      this.logger.log(`PATCH /organizers/${id} body: ${JSON.stringify(input)}`);
      const useCaseInput = new UpdateOrganizerUseCaseInput(id, input);
      return await this.updateOrganizer.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrganizerById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      this.logger.log(`DELETE /organizers/${id}`);
      const useCaseInput = new DeleteOrganizerUseCaseInput(id);
      return await this.deleteOrganizer.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
