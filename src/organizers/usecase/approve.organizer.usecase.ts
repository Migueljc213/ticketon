import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrganizerRepository from '../domain/interface/organizer.repository.interface';
import { OrganizerRepositoryToken } from '../organizer.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import ApproveOrganizerUseCaseInput from './dto/input/approve.organizer.usecase.input';
import ApproveOrganizerUseCaseOutput from './dto/output/approve.organizer.usecase.output';

@Injectable()
export default class ApproveOrganizerUseCase
  implements
    IUsecase<ApproveOrganizerUseCaseInput, ApproveOrganizerUseCaseOutput>
{
  private readonly logger = new Logger(ApproveOrganizerUseCase.name);

  constructor(
    @Inject(OrganizerRepositoryToken)
    private readonly repository: IOrganizerRepository,
  ) {}

  async run(
    input: ApproveOrganizerUseCaseInput,
  ): Promise<ApproveOrganizerUseCaseOutput> {
    this.logger.log(
      `${input.isVerified ? 'Approving' : 'Rejecting'} organizer`,
      input.organizerId,
    );

    const organizer = await this.repository.findById(input.organizerId);
    if (!organizer) {
      throw new Error('Organizer not found');
    }

    const updated = await this.repository.update(input.organizerId, {
      isVerified: input.isVerified,
    });

    return updated;
  }
}

