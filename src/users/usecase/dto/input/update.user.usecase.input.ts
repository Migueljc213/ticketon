import UpdateUserUseCaseInputDto from 'src/users/external/dto/update.user.usecase.input.dto';

export default class UpdateUserUseCaseInput extends UpdateUserUseCaseInputDto {
  id: number;

  constructor(id: number, data: UpdateUserUseCaseInputDto) {
    super(data);
    this.id = id;
  }
}
