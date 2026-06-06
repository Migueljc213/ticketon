import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import User from 'src/users/domain/entity/User.entity';

interface DemoUser {
  name: string;
  email: string;
  password: string;
  cpfCnpj: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    name: 'Cliente Demo',
    email: 'cliente@demo.com',
    password: 'demo123',
    cpfCnpj: '000.000.000-00',
  },
  {
    name: 'Admin Ticketon',
    email: 'admin@ticketon.com.br',
    password: 'admin123',
    cpfCnpj: '111.111.111-11',
  },
  {
    name: 'Organizador Demo',
    email: 'organizador@demo.com',
    password: 'demo123',
    cpfCnpj: '222.222.222-22',
  },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedDemoUsers();
  }

  private async seedDemoUsers() {
    for (const userData of DEMO_USERS) {
      const exists = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (exists) continue;

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = this.userRepository.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        cpfCnpj: userData.cpfCnpj,
        bankInfo: null,
      });

      await this.userRepository.save(user);
      this.logger.log(`Usuário demo criado: ${userData.email}`);
    }
  }
}
