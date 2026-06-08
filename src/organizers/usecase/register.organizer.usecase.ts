import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import IUsecase from 'src/common/interfaces/IUseCase';
import User from 'src/users/domain/entity/User.entity';
import Organizer from '../domain/entity/Organizer.entity';

export interface RegisterOrganizerInput {
  userId: number;
  companyName: string;
  cnpj: string;
  phone: string;
  city: string;
  state: string;
  description?: string;
}

export interface RegisterOrganizerOutput {
  organizerId: number;
  companyName: string;
  message: string;
}

@Injectable()
export default class RegisterOrganizerUseCase
  implements IUsecase<RegisterOrganizerInput, RegisterOrganizerOutput>
{
  private readonly logger = new Logger(RegisterOrganizerUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(input: RegisterOrganizerInput): Promise<RegisterOrganizerOutput> {
    this.logger.log(`Register organizer — user ${input.userId}`);

    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: input.userId } });
      if (!user) throw new NotFoundException('Usuário não encontrado.');

      if (user.role !== 'participant') {
        throw new ForbiddenException(
          'Apenas participantes podem solicitar uma conta de organizador.',
        );
      }

      const byCnpj = await manager.findOne(Organizer, {
        where: { cnpj: input.cnpj },
      });
      if (byCnpj) {
        throw new BadRequestException('Este CNPJ já está cadastrado na plataforma.');
      }

      const byUser = await manager.findOne(Organizer, {
        where: { userId: input.userId },
      });
      if (byUser) {
        throw new BadRequestException('Este usuário já possui uma conta de organizador.');
      }

      const organizer = manager.create(Organizer, {
        userId: input.userId,
        companyName: input.companyName,
        cnpj: input.cnpj,
        phone: input.phone,
        city: input.city,
        state: input.state,
        description: input.description ?? null,
        address: null,
        zipcode: null,
        logoUrl: null,
        website: null,
        isVerified: false,
        isActive: true,
      });

      const saved = await manager.save(Organizer, organizer);
      await manager.update(User, input.userId, { role: 'organizer' });

      this.logger.log(`Organizer ${saved.id} created for user ${input.userId}`);

      return {
        organizerId: saved.id,
        companyName: saved.companyName,
        message:
          'Conta de organizador criada com sucesso! Faça login novamente para acessar o painel.',
      };
    });
  }
}
