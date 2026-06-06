import { Inject, Injectable, Logger } from '@nestjs/common';
import type IEventRepository from '../domain/interface/event.repository.interface';
import { EventRepositoryToken } from '../event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import UpdateEventUseCaseInput from './dto/input/update.event.usecase.input';
import UpdateEventUseCaseOutput from './dto/output/update.event.usecase.output';

@Injectable()
export default class UpdateEventUseCase
  implements IUsecase<UpdateEventUseCaseInput, UpdateEventUseCaseOutput>
{
  private readonly logger = new Logger(UpdateEventUseCase.name);

  constructor(
    @Inject(EventRepositoryToken)
    private readonly repository: IEventRepository,
  ) {}

  async run(input: UpdateEventUseCaseInput): Promise<UpdateEventUseCaseOutput> {
    this.logger.log('Updating event', input.id);

    const existingEvent = await this.repository.findById(input.id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    const updateData: Partial<UpdateEventUseCaseInput> = {};

    if (input.organizerId !== undefined)
      updateData.organizerId = input.organizerId;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.eventDate !== undefined) updateData.eventDate = input.eventDate;
    if (input.eventEndDate !== undefined)
      updateData.eventEndDate = input.eventEndDate;
    if (input.locationType !== undefined)
      updateData.locationType = input.locationType;
    if (input.venueName !== undefined) updateData.venueName = input.venueName;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.state !== undefined) updateData.state = input.state;
    if (input.zipcode !== undefined) updateData.zipcode = input.zipcode;
    if (input.onlineUrl !== undefined) updateData.onlineUrl = input.onlineUrl;
    if (input.bannerUrl !== undefined) updateData.bannerUrl = input.bannerUrl;
    if (input.maxAttendees !== undefined)
      updateData.maxAttendees = input.maxAttendees;
    if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;

    return this.repository.update(input.id, updateData);
  }
}
