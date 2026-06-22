import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type IUsecase from 'src/common/interfaces/IUseCase';
import type IUserRepository from 'src/users/domain/interface/user.repository.interface';
import { UserRepositoryToken } from 'src/users/user.token';
import { LoginUseCaseToken } from './auth.token';
import LoginUseCaseInputDto from './external/dto/login.usecase.input.dto';
import LoginUseCaseOutput from './usecase/dto/output/login.usecase.output';
import LoginUseCaseInput from './usecase/dto/input/login.usecase.input';
import type { SocialProfile } from './strategies/google.strategy';

@Controller('/auth')
export default class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(LoginUseCaseToken)
    private readonly loginUseCase: IUsecase<LoginUseCaseInput, LoginUseCaseOutput>,
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─────────────────────────────────────────────
  // E-mail + senha
  // ─────────────────────────────────────────────

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() input: LoginUseCaseInputDto): Promise<LoginUseCaseOutput> {
    try {
      this.logger.log(`POST /auth/login email: ${input.email}`);
      return await this.loginUseCase.run(new LoginUseCaseInput(input));
    } catch {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }
  }

  // ─────────────────────────────────────────────
  // Google OAuth
  // ─────────────────────────────────────────────

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport redireciona para o Google — nada a fazer aqui
  }

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async googleCallback(@Req() req: { user: SocialProfile }, @Res() res: any) {
    const redirectUrl = await this.handleSocialLogin(req.user);
    res.redirect(redirectUrl);
  }

  // ─────────────────────────────────────────────
  // Facebook OAuth
  // ─────────────────────────────────────────────

  @Get('/facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin() {
    // Passport redireciona para o Facebook — nada a fazer aqui
  }

  @Get('/facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async facebookCallback(@Req() req: { user: SocialProfile }, @Res() res: any) {
    const redirectUrl = await this.handleSocialLogin(req.user);
    res.redirect(redirectUrl);
  }

  // ─────────────────────────────────────────────
  // Helper compartilhado entre providers sociais
  // ─────────────────────────────────────────────

  private async handleSocialLogin(profile: SocialProfile): Promise<string> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3002';

    if (!profile.email) {
      this.logger.warn(`Social login without email: provider=${profile.provider}`);
      return `${frontendUrl}/login?error=no_email`;
    }

    try {
      let user = await this.userRepository.findByEmail(profile.email);

      if (!user) {
        user = await this.userRepository.create({
          name: profile.name,
          email: profile.email,
          password: null,
          cpfCnpj: null,
          role: 'participant',
          avatarUrl: profile.avatarUrl,
        });
        this.logger.log(`Social user created: ${profile.email} (${profile.provider})`);
      } else {
        // Atualiza avatar se ainda não tem
        if (!user.avatarUrl && profile.avatarUrl) {
          await this.userRepository.update(user.id, { avatarUrl: profile.avatarUrl });
        }
        this.logger.log(`Social user login: ${profile.email} (${profile.provider})`);
      }

      const expiresIn = user.role === 'participant' ? '30d' : '1d';
      const token = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn },
      );

      const params = new URLSearchParams({
        token,
        userId: String(user.id),
        email: user.email,
        name: user.name,
        role: user.role ?? 'participant',
      });

      return `${frontendUrl}/auth/social?${params.toString()}`;
    } catch (err) {
      this.logger.error('Social login error', err);
      return `${frontendUrl}/login?error=social_fail`;
    }
  }
}
