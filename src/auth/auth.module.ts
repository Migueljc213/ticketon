import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StringValue } from 'ms';
import User from 'src/users/domain/entity/User.entity';
import UserRepository from 'src/users/external/repository/user.repository';
import { UserRepositoryToken } from 'src/users/user.token';
import AuthController from './auth.controller';
import LoginUseCase from './usecase/login.usecase';
import { LoginUseCaseToken } from './auth.token';
import JwtStrategy from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: UserRepositoryToken,
      useClass: UserRepository,
    },
    {
      provide: LoginUseCaseToken,
      useClass: LoginUseCase,
    },
    JwtStrategy,
  ],
  exports: [JwtModule],
})
export default class AuthModule {}
