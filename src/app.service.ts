import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to GoWagr Backend Engineering Test by R.O. Olatunji';
  }
}
