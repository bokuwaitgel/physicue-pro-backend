import { Test, TestingModule } from '@nestjs/testing';
import { CourcesController } from './cources.controller';

describe('CourcesController', () => {
  let controller: CourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourcesController],
    }).compile();

    controller = module.get<CourcesController>(CourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
