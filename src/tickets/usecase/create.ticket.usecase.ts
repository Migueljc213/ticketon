import { Inject, Injectable, Logger } from '@nestjs/common';
import type ITicketRepository from '../domain/interface/ticket.repository.interface';
import { TicketRepositoryToken } from '../ticket.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import CreateTicketUseCaseInput from './dto/input/create.ticket.usecase.input';
import CreateTicketUseCaseOutput from './dto/output/create.ticket.usecase.output';

@Injectable()
export default class CreateTicketUseCase implements IUsecase<
  CreateTicketUseCaseInput,
  CreateTicketUseCaseOutput
> {
  private readonly logger = new Logger(CreateTicketUseCase.name);

  constructor(
    @Inject(TicketRepositoryToken)
    private readonly repository: ITicketRepository,
  ) {}

  async run(
    input: CreateTicketUseCaseInput,
  ): Promise<CreateTicketUseCaseOutput> {
    this.logger.log('Creating ticket', input.name);

    const createData = {
      ...input,
      saleStartDate: input.saleStartDate
        ? new Date(input.saleStartDate)
        : undefined,
      saleEndDate: input.saleEndDate ? new Date(input.saleEndDate) : undefined,
    };
    return this.repository.create(createData);
  }
}
