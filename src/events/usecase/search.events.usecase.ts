import { Inject, Injectable, Logger } from '@nestjs/common';
import type IEventRepository from '../domain/interface/event.repository.interface';
import { EventRepositoryToken } from '../event.token';
import IUsecase from 'src/common/interfaces/IUseCase';
import SearchEventsUseCaseInput from './dto/input/search.events.usecase.input';
import SearchEventsUseCaseOutput from './dto/output/search.events.usecase.output';
import Event from '../domain/entity/Event.entity';

type EventFilter = (event: Event) => boolean;

@Injectable()
export default class SearchEventsUseCase
  implements IUsecase<SearchEventsUseCaseInput, SearchEventsUseCaseOutput>
{
  private readonly logger = new Logger(SearchEventsUseCase.name);

  constructor(
    @Inject(EventRepositoryToken)
    private readonly repository: IEventRepository,
  ) {}

  private createTitleFilter(searchTerm: string): EventFilter {
    const normalizedSearch = searchTerm.toLowerCase();
    return (event: Event) =>
      event.title.toLowerCase().includes(normalizedSearch);
  }

  private createCategoryFilter(category: string): EventFilter {
    return (event: Event) => event.category === category;
  }

  private createCityFilter(city: string): EventFilter {
    const normalizedCity = city.toLowerCase();
    return (event: Event) => event.city?.toLowerCase() === normalizedCity;
  }

  private createStateFilter(state: string): EventFilter {
    const normalizedState = state.toUpperCase();
    return (event: Event) => event.state?.toUpperCase() === normalizedState;
  }

  private createStartDateFilter(startDate: Date): EventFilter {
    return (event: Event) => new Date(event.eventDate) >= startDate;
  }

  private createEndDateFilter(endDate: Date): EventFilter {
    return (event: Event) => new Date(event.eventDate) <= endDate;
  }

  private createPublishedFilter(isPublished: boolean): EventFilter {
    return (event: Event) => event.isPublished === isPublished;
  }

  private buildFilters(input: SearchEventsUseCaseInput): EventFilter[] {
    const filters: EventFilter[] = [];

    if (input.title) {
      filters.push(this.createTitleFilter(input.title));
    }

    if (input.category) {
      filters.push(this.createCategoryFilter(input.category));
    }

    if (input.city) {
      filters.push(this.createCityFilter(input.city));
    }

    if (input.state) {
      filters.push(this.createStateFilter(input.state));
    }

    if (input.startDate) {
      filters.push(this.createStartDateFilter(input.startDate));
    }

    if (input.endDate) {
      filters.push(this.createEndDateFilter(input.endDate));
    }

    if (input.isPublished !== undefined) {
      filters.push(this.createPublishedFilter(input.isPublished));
    }

    return filters;
  }

  private applyFilters(events: Event[], filters: EventFilter[]): Event[] {
    return filters.reduce(
      (filtered, filter) => filtered.filter(filter),
      events,
    );
  }

  async run(
    input: SearchEventsUseCaseInput,
  ): Promise<SearchEventsUseCaseOutput> {
    this.logger.log('Searching events with filters', input);

    const allEvents = await this.repository.findAll();
    const filters = this.buildFilters(input);
    const filteredEvents = this.applyFilters(allEvents, filters);

    return new SearchEventsUseCaseOutput(filteredEvents);
  }
}
