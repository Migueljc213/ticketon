import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './domain/entity/User.entity';
import UserRepository from './external/repository/user.repository';
import {
  CreateUserToken,
  DeleteUserToken,
  FindAllUsersToken,
  FindUserByIdToken,
  UpdateUserToken,
  UserRepositoryToken,
} from './user.token';
import UserController from './user.controller';
import CreateUserUseCase from './usecase/create.user.usecase';
import FindUserByIdUseCase from './usecase/find.user.by.id.usecase';
import FindAllUsersUseCase from './usecase/find.all.users.usecase';
import UpdateUserUseCase from './usecase/update.user.usecase';
import DeleteUserUseCase from './usecase/delete.user.usecase';

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
    {
      provide: FindUserByIdToken,
      useClass: FindUserByIdUseCase,
    },
    {
      provide: FindAllUsersToken,
      useClass: FindAllUsersUseCase,
    },
    {
      provide: UpdateUserToken,
      useClass: UpdateUserUseCase,
    },
    {
      provide: DeleteUserToken,
      useClass: DeleteUserUseCase,
    },
  ],
})
export default class UserModule {}
