import { Inject, Injectable, Logger } from '@nestjs/common';
import type IEventRepository from '../domain/interface/event.repository.interface';
import { EventRepositoryToken } from '../event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import UpdateEventUseCaseInput from './dto/input/update.event.usecase.input';
import UpdateEventUseCaseOutput from './dto/output/update.event.usecase.output';

@Injectable()
export default class UpdateEventUseCase implements IUsecase<
  UpdateEventUseCaseInput,
  UpdateEventUseCaseOutput
> {
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

    const FIELDS = [
      'organizerId', 'title', 'description', 'category',
      'eventDate', 'eventEndDate', 'locationType', 'venueName',
      'address', 'city', 'state', 'zipcode', 'onlineUrl', 'bannerUrl',
      'maxAttendees', 'isPublic', 'isPublished', 'status',
    ] as const;

    const inputAny = input as unknown as Record<string, unknown>;
    const updateData: Partial<typeof existingEvent> = {};
    for (const field of FIELDS) {
      if (inputAny[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = inputAny[field];
      }
    }

    if (input.isPublished === true && !existingEvent.publishedAt) {
      updateData.publishedAt = new Date();
    }

    return this.repository.update(input.id, updateData);
  }
}
