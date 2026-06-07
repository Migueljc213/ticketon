import { Inject, Injectable, Logger } from '@nestjs/common';
import type IEventRepository from '../domain/interface/event.repository.interface';
import { EventRepositoryToken } from '../event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import DeleteEventUseCaseInput from './dto/input/delete.event.usecase.input';

@Injectable()
export default class DeleteEventUseCase implements IUsecase<
  DeleteEventUseCaseInput,
  void
> {
  private readonly logger = new Logger(DeleteEventUseCase.name);

  constructor(
    @Inject(EventRepositoryToken)
    private readonly repository: IEventRepository,
  ) {}

  async run(input: DeleteEventUseCaseInput): Promise<void> {
    this.logger.log('Deleting event', input.id);

    const existingEvent = await this.repository.findById(input.id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    await this.repository.delete(input.id);
  }
}
