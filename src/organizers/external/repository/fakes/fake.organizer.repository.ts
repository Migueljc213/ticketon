import Organizer from 'src/organizers/domain/entity/Organizer.entity';
import IOrganizerRepository from 'src/organizers/domain/interface/organizer.repository.interface';

export default class FakeOrganizerRepository implements IOrganizerRepository {
  private organizers: Organizer[] = [];
  private nextId = 1;

  async create(input: Partial<Organizer>): Promise<Organizer> {
    const organizer = new Organizer();

    organizer.id = this.nextId++;
    organizer.userId = input.userId!;
    organizer.companyName = input.companyName!;
    organizer.cnpj = input.cnpj!;
    organizer.phone = input.phone!;
    organizer.address = input.address || null;
    organizer.city = input.city || null;
    organizer.state = input.state || null;
    organizer.zipcode = input.zipcode || null;
    organizer.description = input.description || null;
    organizer.logoUrl = input.logoUrl || null;
    organizer.website = input.website || null;
    organizer.isVerified = input.isVerified || false;
    organizer.isActive = input.isActive !== undefined ? input.isActive : true;
    organizer.createdAt = new Date();
    organizer.updatedAt = new Date();

    this.organizers.push(organizer);

    return organizer;
  }

  async findById(id: number): Promise<Organizer | null> {
    const organizer = this.organizers.find((o) => o.id === id);
    return organizer || null;
  }

  async findByUserId(userId: number): Promise<Organizer | null> {
    const organizer = this.organizers.find((o) => o.userId === userId);
    return organizer || null;
  }

  async findByCnpj(cnpj: string): Promise<Organizer | null> {
    const organizer = this.organizers.find((o) => o.cnpj === cnpj);
    return organizer || null;
  }

  async findAll(): Promise<Organizer[]> {
    return [...this.organizers];
  }

  async update(id: number, input: Partial<Organizer>): Promise<Organizer> {
    const organizerIndex = this.organizers.findIndex((o) => o.id === id);
    if (organizerIndex === -1) {
      throw new Error('Organizer not found');
    }

    Object.keys(input).forEach((key) => {
      if (input[key] !== undefined) {
        this.organizers[organizerIndex][key] = input[key];
      }
    });

    this.organizers[organizerIndex].updatedAt = new Date();

    return this.organizers[organizerIndex];
  }

  async delete(id: number): Promise<void> {
    const organizerIndex = this.organizers.findIndex((o) => o.id === id);
    if (organizerIndex !== -1) {
      this.organizers.splice(organizerIndex, 1);
    }
  }
}
