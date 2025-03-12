import { Test, TestingModule } from '@nestjs/testing';
import { CourseProgressResolver } from './course-progress.resolver';
import { CourseProgressService } from './course-progress.service';

describe('CourseProgressResolver', () => {
  let resolver: CourseProgressResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseProgressResolver, CourseProgressService],
    }).compile();

    resolver = module.get<CourseProgressResolver>(CourseProgressResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
