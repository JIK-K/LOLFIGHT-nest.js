import { Test, TestingModule } from '@nestjs/testing';
import { JudgmentService } from './judgment.service';

describe('JudgmentService', () => {
  let service: JudgmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JudgmentService],
    }).compile();

    service = module.get<JudgmentService>(JudgmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
