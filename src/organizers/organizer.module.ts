import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Organizer from './domain/entity/Organizer.entity';
import OrganizerRepository from './external/repository/organizer.repository';
import {
  CreateOrganizerToken,
  DeleteOrganizerToken,
  FindAllOrganizersToken,
  FindOrganizerByIdToken,
  OrganizerRepositoryToken,
  UpdateOrganizerToken,
} from './organizer.token';
import OrganizerController from './organizer.controller';
import CreateOrganizerUseCase from './usecase/create.organizer.usecase';
import FindOrganizerByIdUseCase from './usecase/find.organizer.by.id.usecase';
import FindAllOrganizersUseCase from './usecase/find.all.organizers.usecase';
import UpdateOrganizerUseCase from './usecase/update.organizer.usecase';
import DeleteOrganizerUseCase from './usecase/delete.organizer.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Organizer])],
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
  ],
})
export default class OrganizerModule {}
