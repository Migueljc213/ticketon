import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { ConfigModule } from '@nestjs/config';
import UserModule from './users/user.module';
import User from './users/domain/entity/User.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([User]),
    UserModule,
  ],
  providers: [],
})
export class AppModule {}
