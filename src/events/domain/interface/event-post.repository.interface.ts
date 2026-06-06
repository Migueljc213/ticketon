import EventPost from '../entity/EventPost.entity';

export default interface IEventPostRepository {
  create(input: Partial<EventPost>): Promise<EventPost>;
  findById(id: number): Promise<EventPost | null>;
  findByEventId(eventId: number): Promise<EventPost[]>;
  findByUserId(userId: number): Promise<EventPost[]>;
  findAll(): Promise<EventPost[]>;
  update(id: number, input: Partial<EventPost>): Promise<EventPost>;
  delete(id: number): Promise<void>;
}
