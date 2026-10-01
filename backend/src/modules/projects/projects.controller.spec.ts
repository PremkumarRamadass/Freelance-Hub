import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { User } from '../../entities/user.entity.js';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let mockService: any;
  let mockUserRepo: any;
  const mockReq: any = { headers: {} };

  beforeEach(async () => {
    mockService = {
      findAll: vi.fn(),
      findMarketplace: vi.fn(),
      findMyProjects: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      remove: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn().mockResolvedValue({ id: 'user_1', name: 'Prem', role: 'CLIENT' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should list all projects', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1', name: 'Test Prj' }]);
    const res = await controller.findAll();
    expect(res.length).toBe(1);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('should get project by id', async () => {
    mockService.findOne.mockResolvedValue({ id: '1', name: 'Test Prj' });
    const res = await controller.findOne('1');
    expect(res.id).toBe('1');
    expect(mockService.findOne).toHaveBeenCalledWith('1');
  });

  it('should create project via create', async () => {
    mockService.create.mockResolvedValue({ id: '1', name: 'Created' });
    const res = await controller.create({ name: 'Created' }, mockReq);
    expect((res as any).name).toBe('Created');
  });

  it('should remove project via remove', async () => {
    mockService.remove.mockResolvedValue(undefined);
    const res = await controller.remove('1', mockReq);
    expect(res.success).toBe(true);
  });
});
