export default class FindTicketsByEventIdUseCaseInput {
  eventId: number;

  constructor(eventId: number) {
    this.eventId = eventId;
  }
}
