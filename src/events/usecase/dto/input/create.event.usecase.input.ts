import CreateEventUseCaseInputDto from 'src/events/external/dto/create.event.usecase.input.dto';

export default class CreateEventUseCaseInput extends CreateEventUseCaseInputDto {
  constructor(data: CreateEventUseCaseInput) {
    super(data);
    Object.assign(this, data);
  }
}
