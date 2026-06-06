import CreateEventPostUseCaseInputDto from 'src/events/external/dto/create.event.post.usecase.input.dto';

export default class CreateEventPostUseCaseInput extends CreateEventPostUseCaseInputDto {
  constructor(dto: CreateEventPostUseCaseInputDto) {
    super(dto);
    Object.assign(this, dto);
  }
}
