import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrganizerRepository from '../domain/interface/organizer.repository.interface';
import { OrganizerRepositoryToken } from '../organizer.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindAllOrganizersUseCaseOutput from './dto/output/find.all.organizers.usecase.output';

@Injectable()
export default class FindAllOrganizersUseCase implements IUsecase<
  void,
  FindAllOrganizersUseCaseOutput
> {
  private readonly logger = new Logger(FindAllOrganizersUseCase.name);

  constructor(
    @Inject(OrganizerRepositoryToken)
    private readonly repository: IOrganizerRepository,
  ) {}

  async run(): Promise<FindAllOrganizersUseCaseOutput> {
    this.logger.log('Finding all organizers');

    const organizers = await this.repository.findAll();

    return new FindAllOrganizersUseCaseOutput(organizers);
  }
}
