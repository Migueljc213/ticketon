import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import type IUsecase from 'src/common/interfaces/IUseCase';
import {
  CreateBankAccountToken,
  FindBankAccountToken,
  UpdateBankAccountToken,
} from './bank-account.token';
import CreateBankAccountDto from './external/dto/create.bank-account.dto';
import UpdateBankAccountDto from './external/dto/update.bank-account.dto';
import CreateBankAccountUseCaseInput from './usecase/dto/input/create.bank-account.usecase.input';
import FindBankAccountUseCaseInput from './usecase/dto/input/find.bank-account.usecase.input';
import UpdateBankAccountUseCaseInput from './usecase/dto/input/update.bank-account.usecase.input';
import BankAccountUseCaseOutput from './usecase/dto/output/bank-account.usecase.output';

@SkipThrottle()
@UseGuards(JwtAuthGuard)
@Controller('/bank-accounts')
export default class BankAccountController {
  private readonly logger = new Logger(BankAccountController.name);

  constructor(
    @Inject(CreateBankAccountToken)
    private readonly createBankAccount: IUsecase<
      CreateBankAccountUseCaseInput,
      BankAccountUseCaseOutput
    >,
    @Inject(FindBankAccountToken)
    private readonly findBankAccount: IUsecase<
      FindBankAccountUseCaseInput,
      BankAccountUseCaseOutput | null
    >,
    @Inject(UpdateBankAccountToken)
    private readonly updateBankAccount: IUsecase<
      UpdateBankAccountUseCaseInput,
      BankAccountUseCaseOutput
    >,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyBankAccount(@Req() req: any) {
    this.logger.log(`GET /bank-accounts/me userId=${req.user.id}`);
    const result = await this.findBankAccount.run(
      new FindBankAccountUseCaseInput(req.user.id),
    );
    if (!result) throw new NotFoundException('Conta bancária não cadastrada');
    return result;
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  async upsertMyBankAccount(
    @Req() req: any,
    @Body() body: CreateBankAccountDto,
  ) {
    this.logger.log(`POST /bank-accounts/me userId=${req.user.id}`);
    const input = new CreateBankAccountUseCaseInput({
      ...body,
      userId: req.user.id,
    } as CreateBankAccountUseCaseInput);
    return this.createBankAccount.run(input);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async patchMyBankAccount(
    @Req() req: any,
    @Body() body: UpdateBankAccountDto,
  ) {
    this.logger.log(`PATCH /bank-accounts/me userId=${req.user.id}`);
    const input = new UpdateBankAccountUseCaseInput(req.user.id, body);
    return this.updateBankAccount.run(input);
  }
}
