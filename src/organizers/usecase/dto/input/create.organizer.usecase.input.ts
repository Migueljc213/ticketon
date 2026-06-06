import CreateOrganizerUseCaseInputDto from 'src/organizers/external/dto/create.organizer.usecase.input.dto';

export default class CreateOrganizerUseCaseInput extends CreateOrganizerUseCaseInputDto {
  constructor(data: CreateOrganizerUseCaseInput) {
    super(data);
    Object.assign(this, data);
  }
}
