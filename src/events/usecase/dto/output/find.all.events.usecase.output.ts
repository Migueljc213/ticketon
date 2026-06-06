import Event from 'src/events/domain/entity/Event.entity';

export default class FindAllEventsUseCaseOutput {
  events: Event[];

  constructor(events: Event[]) {
    this.events = events;
  }
}
