import UpdateOrganizerUseCaseInputDto from 'src/organizers/external/dto/update.organizer.usecase.input.dto';

export default class UpdateOrganizerUseCaseInput extends UpdateOrganizerUseCaseInputDto {
  id: number;

  constructor(id: number, data: UpdateOrganizerUseCaseInputDto) {
    super(data);
    this.id = id;
  }
}
