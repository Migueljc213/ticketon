import EventPost from '../entity/EventPost.entity';

export default interface IEventPostRepository {
  create(input: Partial<EventPost>): Promise<EventPost>;
  findByEventId(eventId: number): Promise<EventPost[]>;
}
