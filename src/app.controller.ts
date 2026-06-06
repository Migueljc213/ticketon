import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export default class AppController {
  @Get()
  @HttpCode(HttpStatus.OK)
  root() {
    return { name: 'Ticketon API', status: 'ok' };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok' };
  }
}
