import { Test, TestingModule } from '@nestjs/testing';
import { CourcesService } from './cources.service';

describe('CourcesService', () => {
  let service: CourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourcesService],
    }).compile();

    service = module.get<CourcesService>(CourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
