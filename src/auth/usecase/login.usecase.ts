import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import IUsecase from 'src/common/interfaces/IUseCase';
import type IUserRepository from 'src/users/domain/interface/user.repository.interface';
import { UserRepositoryToken } from 'src/users/user.token';
import LoginUseCaseInput from './dto/input/login.usecase.input';
import LoginUseCaseOutput from './dto/output/login.usecase.output';

@Injectable()
export default class LoginUseCase
  implements IUsecase<LoginUseCaseInput, LoginUseCaseOutput>
{
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async run(input: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    this.logger.log('Attempting login for user', input.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log('Login successful for user', user.email);

    return new LoginUseCaseOutput(accessToken, user.id, user.email);
  }
}
