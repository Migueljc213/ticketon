import Organizer from 'src/organizers/domain/entity/Organizer.entity';

export default class FindAllOrganizersUseCaseOutput {
  organizers: Organizer[];

  constructor(organizers: Organizer[]) {
    this.organizers = organizers;
  }
}
