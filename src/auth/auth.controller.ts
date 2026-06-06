import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUseCaseToken } from './auth.token';
import type IUsecase from 'src/common/interfaces/IUseCase';
import LoginUseCaseInputDto from './external/dto/login.usecase.input.dto';
import LoginUseCaseOutput from './usecase/dto/output/login.usecase.output';
import LoginUseCaseInput from './usecase/dto/input/login.usecase.input';

@Controller('/auth')
export default class AuthController {
  constructor(
    @Inject(LoginUseCaseToken)
    private readonly loginUseCase: IUsecase<
      LoginUseCaseInput,
      LoginUseCaseOutput
    >,
  ) {}

  private readonly logger = new Logger(AuthController.name);

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: LoginUseCaseInputDto,
  ): Promise<LoginUseCaseOutput> {
    try {
      this.logger.log(
        `POST /auth/login body: ${JSON.stringify({ email: input.email })}`,
      );
      const useCaseInput = new LoginUseCaseInput(input);
      return await this.loginUseCase.run(useCaseInput);
    } catch (e) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }
  }
}
