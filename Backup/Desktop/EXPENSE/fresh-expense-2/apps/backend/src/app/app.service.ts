import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData() {
    return {
      message: 'Welcome to Fresh Expense API',
      version: '1.0.0',
      status: 'healthy'
    };
  }
}
