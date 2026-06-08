import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Organizer from './domain/entity/Organizer.entity';
import User from 'src/users/domain/entity/User.entity';
import OrganizerRepository from './external/repository/organizer.repository';
import {
  ApproveOrganizerToken,
  CreateOrganizerToken,
  DeleteOrganizerToken,
  FindAllOrganizersToken,
  FindOrganizerByIdToken,
  OrganizerRepositoryToken,
  RegisterOrganizerToken,
  UpdateOrganizerToken,
} from './organizer.token';
import OrganizerController from './organizer.controller';
import CreateOrganizerUseCase from './usecase/create.organizer.usecase';
import FindOrganizerByIdUseCase from './usecase/find.organizer.by.id.usecase';
import FindAllOrganizersUseCase from './usecase/find.all.organizers.usecase';
import UpdateOrganizerUseCase from './usecase/update.organizer.usecase';
import DeleteOrganizerUseCase from './usecase/delete.organizer.usecase';
import ApproveOrganizerUseCase from './usecase/approve.organizer.usecase';
import RegisterOrganizerUseCase from './usecase/register.organizer.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Organizer, User])],
  controllers: [OrganizerController],
  providers: [
    {
      provide: OrganizerRepositoryToken,
      useClass: OrganizerRepository,
    },
    {
      provide: CreateOrganizerToken,
      useClass: CreateOrganizerUseCase,
    },
    {
      provide: FindOrganizerByIdToken,
      useClass: FindOrganizerByIdUseCase,
    },
    {
      provide: FindAllOrganizersToken,
      useClass: FindAllOrganizersUseCase,
    },
    {
      provide: UpdateOrganizerToken,
      useClass: UpdateOrganizerUseCase,
    },
    {
      provide: DeleteOrganizerToken,
      useClass: DeleteOrganizerUseCase,
    },
    {
      provide: ApproveOrganizerToken,
      useClass: ApproveOrganizerUseCase,
    },
    {
      provide: RegisterOrganizerToken,
      useClass: RegisterOrganizerUseCase,
    },
  ],
})
export default class OrganizerModule {}
