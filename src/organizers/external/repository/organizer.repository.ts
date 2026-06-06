import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Organizer from 'src/organizers/domain/entity/Organizer.entity';
import IOrganizerRepository from 'src/organizers/domain/interface/organizer.repository.interface';
import { Repository } from 'typeorm';

@Injectable()
export default class OrganizerRepository implements IOrganizerRepository {
  constructor(
    @InjectRepository(Organizer)
    private readonly repository: Repository<Organizer>,
  ) {}

  async create(input: Partial<Organizer>): Promise<Organizer> {
    return this.repository.save(input);
  }

  async findById(id: number): Promise<Organizer | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: number): Promise<Organizer | null> {
    return this.repository.findOne({ where: { userId } });
  }

  async findByCnpj(cnpj: string): Promise<Organizer | null> {
    return this.repository.findOne({ where: { cnpj } });
  }

  async findAll(): Promise<Organizer[]> {
    return this.repository.find();
  }

  async update(id: number, input: Partial<Organizer>): Promise<Organizer> {
    await this.repository.update(id, input);
    const updatedOrganizer = await this.findById(id);
    if (!updatedOrganizer) {
      throw new Error('Organizer not found after update');
    }
    return updatedOrganizer;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
