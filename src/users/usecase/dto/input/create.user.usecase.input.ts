import CreateUserUseCaseInputDto from 'src/users/external/dto/create.user.usecase.input.dto';

export default class CreateUserUseCaseInput extends CreateUserUseCaseInputDto {
  constructor(data: CreateUserUseCaseInput) {
    super(data);
    Object.assign(this, data);
  }
}
