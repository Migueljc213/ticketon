import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrganizerRepository from '../domain/interface/organizer.repository.interface';
import { OrganizerRepositoryToken } from '../organizer.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import DeleteOrganizerUseCaseInput from './dto/input/delete.organizer.usecase.input';

@Injectable()
export default class DeleteOrganizerUseCase
  implements IUsecase<DeleteOrganizerUseCaseInput, void>
{
  private readonly logger = new Logger(DeleteOrganizerUseCase.name);

  constructor(
    @Inject(OrganizerRepositoryToken)
    private readonly repository: IOrganizerRepository,
  ) {}

  async run(input: DeleteOrganizerUseCaseInput): Promise<void> {
    this.logger.log('Deleting organizer', input.id);

    const existingOrganizer = await this.repository.findById(input.id);
    if (!existingOrganizer) {
      throw new Error('Organizer not found');
    }

    await this.repository.delete(input.id);
  }
}
