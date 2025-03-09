import { Test, TestingModule } from '@nestjs/testing';
import { BadgesResolver } from './badges.resolver';
import { BadgesService } from './badges.service';

describe('BadgesResolver', () => {
  let resolver: BadgesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BadgesResolver, BadgesService],
    }).compile();

    resolver = module.get<BadgesResolver>(BadgesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
