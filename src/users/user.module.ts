import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './domain/entity/User.entity';
import UserRepository from './external/repository/user.repository';
import { CreateUserToken, UserRepositoryToken } from './user.token';
import UserController from './user.controller';
import CreateUserUseCase from './usecase/create.user.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepositoryToken,
      useClass: UserRepository,
    },
    {
      provide: CreateUserToken,
      useClass: CreateUserUseCase,
    },
  ],
})
export default class UserModule {}
