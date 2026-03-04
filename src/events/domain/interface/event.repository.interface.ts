import Event from '../entity/Event.entity';

export default interface IEventRepository {
  create(input: Partial<Event>): Promise<Event>;
  findById(id: number): Promise<Event | null>;
  findByOrganizerId(organizerId: number): Promise<Event[]>;
  findAll(): Promise<Event[]>;
  update(id: number, input: Partial<Event>): Promise<Event>;
  delete(id: number): Promise<void>;
}
