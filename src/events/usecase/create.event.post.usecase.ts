import { Inject, Injectable, Logger } from '@nestjs/common';
import type IEventPostRepository from '../domain/interface/event-post.repository.interface';
import type IEventRepository from '../domain/interface/event.repository.interface';
import type IOrderRepository from 'src/orders/domain/interface/order.repository.interface';
import { EventPostRepositoryToken } from '../event.token';
import { EventRepositoryToken } from '../event.token';
import { OrderRepositoryToken } from 'src/orders/order.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import CreateEventPostUseCaseInput from './dto/input/create.event.post.usecase.input';
import CreateEventPostUseCaseOutput from './dto/output/create.event.post.usecase.output';

@Injectable()
export default class CreateEventPostUseCase implements IUsecase<
  CreateEventPostUseCaseInput,
  CreateEventPostUseCaseOutput
> {
  private readonly logger = new Logger(CreateEventPostUseCase.name);

  constructor(
    @Inject(EventPostRepositoryToken)
    private readonly eventPostRepository: IEventPostRepository,
    @Inject(EventRepositoryToken)
    private readonly eventRepository: IEventRepository,
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async run(
    input: CreateEventPostUseCaseInput,
  ): Promise<CreateEventPostUseCaseOutput> {
    this.logger.log('Creating event post', input.eventId);

    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (input.orderId) {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      if (order.userId !== input.userId) {
        throw new Error('Order does not belong to user');
      }
      if (order.eventId !== input.eventId) {
        throw new Error('Order does not belong to event');
      }
      if (order.status !== 'paid') {
        throw new Error('Order is not paid');
      }
    }

    const post = await this.eventPostRepository.create({
      eventId: input.eventId,
      userId: input.userId,
      orderId: input.orderId,
      content: input.content,
      isApproved: true,
      isActive: true,
    });

    return post;
  }
}
