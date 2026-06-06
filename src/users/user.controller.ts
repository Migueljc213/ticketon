import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserToken,
  DeleteUserToken,
  FindAllUsersToken,
  FindUserByIdToken,
  UpdateUserToken,
} from './user.token';
import type IUsecase from 'src/common/interfaces/IUseCase';
import CreateUserUseCaseInputDto from './external/dto/create.user.usecase.input.dto';
import CreateUserUseCaseOutput from './usecase/dto/output/create.user.usecase.output';
import CreateUserUseCaseInput from './usecase/dto/input/create.user.usecase.input';
import FindUserByIdUseCaseInput from './usecase/dto/input/find.user.by.id.usecase.input';
import FindUserByIdUseCaseOutput from './usecase/dto/output/find.user.by.id.usecase.output';
import FindAllUsersUseCaseOutput from './usecase/dto/output/find.all.users.usecase.output';
import UpdateUserUseCaseInputDto from './external/dto/update.user.usecase.input.dto';
import UpdateUserUseCaseInput from './usecase/dto/input/update.user.usecase.input';
import UpdateUserUseCaseOutput from './usecase/dto/output/update.user.usecase.output';
import DeleteUserUseCaseInput from './usecase/dto/input/delete.user.usecase.input';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';

@Controller('/users')
export default class UserController {
  constructor(
    @Inject(CreateUserToken)
    private readonly createUser: IUsecase<
      CreateUserUseCaseInput,
      CreateUserUseCaseOutput
    >,
    @Inject(FindUserByIdToken)
    private readonly findUserById: IUsecase<
      FindUserByIdUseCaseInput,
      FindUserByIdUseCaseOutput
    >,
    @Inject(FindAllUsersToken)
    private readonly findAllUsers: IUsecase<void, FindAllUsersUseCaseOutput>,
    @Inject(UpdateUserToken)
    private readonly updateUser: IUsecase<
      UpdateUserUseCaseInput,
      UpdateUserUseCaseOutput
    >,
    @Inject(DeleteUserToken)
    private readonly deleteUser: IUsecase<DeleteUserUseCaseInput, void>,
  ) {}

  private readonly logger = new Logger(UserController.name);

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async postUser(
    @Body() input: CreateUserUseCaseInputDto,
  ): Promise<CreateUserUseCaseOutput> {
    try {
      this.logger.log(`POST /users/ body: ${JSON.stringify({ email: input.email })}`);
      const useCaseInput = new CreateUserUseCaseInput(input);
      return await this.createUser.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<FindAllUsersUseCaseOutput> {
    try {
      this.logger.log('GET /users/');
      return await this.findAllUsers.run();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindUserByIdUseCaseOutput> {
    try {
      this.logger.log(`GET /users/${id}`);
      const useCaseInput = new FindUserByIdUseCaseInput(id);
      return await this.findUserById.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateUserUseCaseInputDto,
  ): Promise<UpdateUserUseCaseOutput> {
    try {
      this.logger.log(`PATCH /users/${id} body: ${JSON.stringify(input)}`);
      const useCaseInput = new UpdateUserUseCaseInput(id, input);
      return await this.updateUser.run(useCaseInput);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      this.logger.log(`DELETE /users/${id}`);
      const useCaseInput = new DeleteUserUseCaseInput(id);
      return await this.deleteUser.run(useCaseInput);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}
