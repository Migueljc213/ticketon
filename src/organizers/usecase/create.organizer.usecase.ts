import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrganizerRepository from '../domain/interface/organizer.repository.interface';
import { OrganizerRepositoryToken } from '../organizer.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import CreateOrganizerUseCaseInput from './dto/input/create.organizer.usecase.input';
import CreateOrganizerUseCaseOutput from './dto/output/create.organizer.usecase.output';

@Injectable()
export default class CreateOrganizerUseCase
  implements
    IUsecase<CreateOrganizerUseCaseInput, CreateOrganizerUseCaseOutput>
{
  private readonly logger = new Logger(CreateOrganizerUseCase.name);

  constructor(
    @Inject(OrganizerRepositoryToken)
    private readonly repository: IOrganizerRepository,
  ) {}

  async run(
    input: CreateOrganizerUseCaseInput,
  ): Promise<CreateOrganizerUseCaseOutput> {
    this.logger.log('Creating organizer', input.companyName);

    const existingByCnpj = await this.repository.findByCnpj(input.cnpj);
    if (existingByCnpj) {
      throw new Error('Organizer with this CNPJ already exists');
    }

    const existingByUserId = await this.repository.findByUserId(input.userId);
    if (existingByUserId) {
      throw new Error('User already has an organizer account');
    }

    return this.repository.create(input);
  }
}
