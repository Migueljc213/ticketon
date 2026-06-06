import CreateTicketUseCaseInputDto from 'src/tickets/external/dto/create.ticket.usecase.input.dto';

export default class CreateTicketUseCaseInput extends CreateTicketUseCaseInputDto {
  constructor(data: CreateTicketUseCaseInput) {
    super(data);
    Object.assign(this, data);
  }
}
