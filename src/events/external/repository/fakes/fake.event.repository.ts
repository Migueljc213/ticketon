import Event from 'src/events/domain/entity/Event.entity';
import IEventRepository from 'src/events/domain/interface/event.repository.interface';

export default class FakeEventRepository implements IEventRepository {
  private events: Event[] = [];
  private nextId = 1;

  async create(input: Partial<Event>): Promise<Event> {
    const event = new Event();

    event.id = this.nextId++;
    event.organizerId = input.organizerId!;
    event.title = input.title!;
    event.description = input.description!;
    event.category = input.category!;
    event.eventDate = input.eventDate!;
    event.eventEndDate = input.eventEndDate || null;
    event.locationType = input.locationType!;
    event.venueName = input.venueName || null;
    event.address = input.address || null;
    event.city = input.city || null;
    event.state = input.state || null;
    event.zipcode = input.zipcode || null;
    event.onlineUrl = input.onlineUrl || null;
    event.bannerUrl = input.bannerUrl || null;
    event.maxAttendees = input.maxAttendees || null;
    event.status = input.status || 'draft';
    event.isPublic = input.isPublic !== undefined ? input.isPublic : true;
    event.isPublished = input.isPublished || false;
    event.publishedAt = input.publishedAt || null;
    event.createdAt = new Date();
    event.updatedAt = new Date();

    this.events.push(event);

    return event;
  }

  async findById(id: number): Promise<Event | null> {
    const event = this.events.find((e) => e.id === id);
    return event || null;
  }

  async findByOrganizerId(organizerId: number): Promise<Event[]> {
    return this.events.filter((e) => e.organizerId === organizerId);
  }

  async findAll(): Promise<Event[]> {
    return [...this.events];
  }

  async update(id: number, input: Partial<Event>): Promise<Event> {
    const eventIndex = this.events.findIndex((e) => e.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    Object.keys(input).forEach((key) => {
      if (input[key] !== undefined) {
        this.events[eventIndex][key] = input[key];
      }
    });

    this.events[eventIndex].updatedAt = new Date();

    return this.events[eventIndex];
  }

  async delete(id: number): Promise<void> {
    const eventIndex = this.events.findIndex((e) => e.id === id);
    if (eventIndex !== -1) {
      this.events.splice(eventIndex, 1);
    }
  }
}
