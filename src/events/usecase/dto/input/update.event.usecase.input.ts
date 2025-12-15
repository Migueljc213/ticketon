import UpdateEventUseCaseInputDto from 'src/events/external/dto/update.event.usecase.input.dto';

export default class UpdateEventUseCaseInput extends UpdateEventUseCaseInputDto {
  id: number;

  constructor(id: number, data: UpdateEventUseCaseInputDto) {
    super(data);
    this.id = id;
  }
}
