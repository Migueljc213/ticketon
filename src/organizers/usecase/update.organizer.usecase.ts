import { Inject, Injectable, Logger } from '@nestjs/common';
import type IOrganizerRepository from '../domain/interface/organizer.repository.interface';
import { OrganizerRepositoryToken } from '../organizer.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import UpdateOrganizerUseCaseInput from './dto/input/update.organizer.usecase.input';
import UpdateOrganizerUseCaseOutput from './dto/output/update.organizer.usecase.output';

@Injectable()
export default class UpdateOrganizerUseCase implements IUsecase<
  UpdateOrganizerUseCaseInput,
  UpdateOrganizerUseCaseOutput
> {
  private readonly logger = new Logger(UpdateOrganizerUseCase.name);

  constructor(
    @Inject(OrganizerRepositoryToken)
    private readonly repository: IOrganizerRepository,
  ) {}

  async run(
    input: UpdateOrganizerUseCaseInput,
  ): Promise<UpdateOrganizerUseCaseOutput> {
    this.logger.log('Updating organizer', input.id);

    const existingOrganizer = await this.repository.findById(input.id);
    if (!existingOrganizer) {
      throw new Error('Organizer not found');
    }

    const updateData: Partial<UpdateOrganizerUseCaseInput> = {};

    if (input.companyName !== undefined)
      updateData.companyName = input.companyName;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.state !== undefined) updateData.state = input.state;
    if (input.zipcode !== undefined) updateData.zipcode = input.zipcode;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.logoUrl !== undefined) updateData.logoUrl = input.logoUrl;
    if (input.website !== undefined) updateData.website = input.website;
    if (input.isVerified !== undefined)
      updateData.isVerified = input.isVerified;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    if (Object.keys(updateData).length === 0) {
      return existingOrganizer;
    }

    return this.repository.update(input.id, updateData);
  }
}
