import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Welcome to GoWagr Backend Engineering Test by R.O. Olatunji"', () => {
      expect(appController.getHello()).toBe('Welcome to GoWagr Backend Engineering Test by R.O. Olatunji');
    });
  });
});
