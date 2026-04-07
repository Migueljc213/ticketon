import Organizer from '../entity/Organizer.entity';

export default interface IOrganizerRepository {
  create(input: Partial<Organizer>): Promise<Organizer>;
  findById(id: number): Promise<Organizer | null>;
  findByUserId(userId: number): Promise<Organizer | null>;
  findByCnpj(cnpj: string): Promise<Organizer | null>;
  findAll(): Promise<Organizer[]>;
  update(id: number, input: Partial<Organizer>): Promise<Organizer>;
  delete(id: number): Promise<void>;
}
