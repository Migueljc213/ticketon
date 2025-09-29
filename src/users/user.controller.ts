import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
} from '@nestjs/common';
import { CreateUserToken } from './user.token';
import type IUsecase from 'src/common/interfaces/IUseCase';
import CreateUserUseCaseInputDto from './external/dto/create.user.usecase.input.dto';
import CreateUserUseCaseOutput from './usecase/dto/output/create.user.usecase.output';
import CreateUserUseCaseInput from './usecase/dto/input/create.user.usecase.input';

@Controller('/users')
export default class UserController {
  constructor(
    @Inject(CreateUserToken)
    private readonly createUser: IUsecase<
      CreateUserUseCaseInput,
      CreateUserUseCaseOutput
    >,
  ) {}

  private readonly logger = new Logger(UserController.name);

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async postUser(
    @Body() input: CreateUserUseCaseInputDto,
  ): Promise<CreateUserUseCaseOutput> {
    try {
      this.logger.log(`POST /users/ body: ${JSON.stringify(input)}`);
      const useCaseInput = new CreateUserUseCaseInput(input);
      return await this.createUser.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
