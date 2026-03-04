import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrganizerRepository from '../domain/interface/organizer.repository.interface';
import { OrganizerRepositoryToken } from '../organizer.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindOrganizerByIdUseCaseInput from './dto/input/find.organizer.by.id.usecase.input';
import FindOrganizerByIdUseCaseOutput from './dto/output/find.organizer.by.id.usecase.output';

@Injectable()
export default class FindOrganizerByIdUseCase
  implements
    IUsecase<FindOrganizerByIdUseCaseInput, FindOrganizerByIdUseCaseOutput>
{
  private readonly logger = new Logger(FindOrganizerByIdUseCase.name);

  constructor(
    @Inject(OrganizerRepositoryToken)
    private readonly repository: IOrganizerRepository,
  ) {}

  async run(
    input: FindOrganizerByIdUseCaseInput,
  ): Promise<FindOrganizerByIdUseCaseOutput> {
    this.logger.log('Finding organizer by id', input.id);

    const organizer = await this.repository.findById(input.id);

    if (!organizer) {
      throw new Error('Organizer not found');
    }

    return organizer;
  }
}
