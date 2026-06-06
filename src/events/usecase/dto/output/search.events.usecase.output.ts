import Event from 'src/events/domain/entity/Event.entity';

export default class SearchEventsUseCaseOutput {
  events: Event[];

  constructor(events: Event[]) {
    this.events = events;
  }
}

