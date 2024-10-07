import { Test, TestingModule } from '@nestjs/testing';
import { JudgmentController } from './judgment.controller';

describe('JudgmentController', () => {
  let controller: JudgmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JudgmentController],
    }).compile();

    controller = module.get<JudgmentController>(JudgmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
