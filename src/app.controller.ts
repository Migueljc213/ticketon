import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { config } from 'dotenv';

config();



@Controller()
export default class AppController {
 constructor(

 ){}

  @Get()
  @HttpCode(HttpStatus.OK)
  root() {
    return { name: 'Ticketon API Versão ' + process.env.NODE_ENV, status: 'ok' };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok' };
  }
}
