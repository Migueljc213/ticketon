import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import IUsecase from 'src/common/interfaces/IUseCase';
import type IUserRepository from 'src/users/domain/interface/user.repository.interface';
import { UserRepositoryToken } from 'src/users/user.token';
import { LOGIN_ATTEMPTS_TOTAL_METRIC } from 'src/common/metrics/business-metrics.module';
import LoginUseCaseInput from './dto/input/login.usecase.input';
import LoginUseCaseOutput from './dto/output/login.usecase.output';

@Injectable()
export default class LoginUseCase implements IUsecase<
  LoginUseCaseInput,
  LoginUseCaseOutput
> {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    @InjectMetric(LOGIN_ATTEMPTS_TOTAL_METRIC)
    private readonly loginAttempts: Counter<string>,
  ) {}

  async run(input: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    this.logger.log('Attempting login for user', input.email);

    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      this.loginAttempts.inc({ status: 'failed' });
      throw new Error('Invalid credentials');
    }

    if (!user.password) {
      this.loginAttempts.inc({ status: 'failed' });
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      this.loginAttempts.inc({ status: 'failed' });
      throw new Error('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = user.role === 'participant' ? '30d' : '1d';
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn });

    this.loginAttempts.inc({ status: 'success' });
    this.logger.log('Login successful for user', user.email);

    return new LoginUseCaseOutput(
      accessToken,
      user.id,
      user.email,
      user.name,
      user.role ?? 'participant',
    );
  }
}
