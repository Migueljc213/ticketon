import LoginUseCaseInputDto from 'src/auth/external/dto/login.usecase.input.dto';

export default class LoginUseCaseInput extends LoginUseCaseInputDto {
  constructor(data: LoginUseCaseInput) {
    super(data);
    Object.assign(this, data);
  }
}
