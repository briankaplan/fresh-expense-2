import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';


export class AppController {
  constructor(private readonly appService: AppService) {}

  
  getData() {
    return this.appService.getData();
  }

  
  healthCheck() {
    return {
      status: 'matched',
      timestamp: new Date().toISOString(),
    };
  }
}
