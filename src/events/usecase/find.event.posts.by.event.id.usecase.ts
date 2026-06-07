import { Inject, Injectable, Logger } from '@nestjs/common';
import type IEventPostRepository from '../domain/interface/event-post.repository.interface';
import { EventPostRepositoryToken } from '../event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import FindEventPostsByEventIdUseCaseInput from './dto/input/find.event.posts.by.event.id.usecase.input';
import FindEventPostsByEventIdUseCaseOutput from './dto/output/find.event.posts.by.event.id.usecase.output';

@Injectable()
export default class FindEventPostsByEventIdUseCase implements IUsecase<
  FindEventPostsByEventIdUseCaseInput,
  FindEventPostsByEventIdUseCaseOutput
> {
  private readonly logger = new Logger(FindEventPostsByEventIdUseCase.name);

  constructor(
    @Inject(EventPostRepositoryToken)
    private readonly eventPostRepository: IEventPostRepository,
  ) {}

  async run(
    input: FindEventPostsByEventIdUseCaseInput,
  ): Promise<FindEventPostsByEventIdUseCaseOutput> {
    this.logger.log('Finding event posts for event', input.eventId);

    const posts = await this.eventPostRepository.findByEventId(input.eventId);

    return new FindEventPostsByEventIdUseCaseOutput(posts);
  }
}
