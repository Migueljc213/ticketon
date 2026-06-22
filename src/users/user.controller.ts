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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
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

@SkipThrottle() // rotas de leitura autenticadas não precisam de throttle
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

  @SkipThrottle({ default: false }) // reativa throttle só para o cadastro
  @Throttle({ default: { ttl: 60_000, limit: 10 } }) // 10 cadastros/min por IP
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async postUser(
    @Body() input: CreateUserUseCaseInputDto,
  ): Promise<CreateUserUseCaseOutput> {
    try {
      this.logger.log(
        `POST /users/ body: ${JSON.stringify({ email: input.email })}`,
      );
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: any) {
    try {
      this.logger.log(`GET /users/me userId=${req.user.id}`);
      const useCaseInput = new FindUserByIdUseCaseInput(req.user.id);
      const user = await this.findUserById.run(useCaseInput);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safe } = user as any;
      return safe;
    } catch (e) {
      throw new NotFoundException(e.message);
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

  @Post(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'avatars');
          if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
          cb(new BadRequestException('Apenas imagens são permitidas (jpeg, png, gif, webp).'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const useCaseInput = new UpdateUserUseCaseInput(id, { avatarUrl } as any);
    const updated = await this.updateUser.run(useCaseInput);
    return { avatarUrl: (updated as any).avatarUrl };
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
