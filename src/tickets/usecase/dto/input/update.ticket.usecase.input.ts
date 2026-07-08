import UpdateTicketUseCaseInputDto from 'src/tickets/external/dto/update.ticket.usecase.input.dto';

export default class UpdateTicketUseCaseInput extends UpdateTicketUseCaseInputDto {
  id: number;

  constructor(id: number, data: UpdateTicketUseCaseInputDto) {
    super(data);
    Object.assign(this, data);
    this.id = id;
  }
}
