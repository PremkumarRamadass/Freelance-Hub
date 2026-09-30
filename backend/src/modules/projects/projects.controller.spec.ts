import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should list all projects', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1', title: 'Test Prj' }]);
    const res = await controller.findAll();
    expect(res.length).toBe(1);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('should get project by id', async () => {
    mockService.findOne.mockResolvedValue({ id: '1', title: 'Test Prj' });
    const res = await controller.findOne('1');
    expect(res.id).toBe('1');
    expect(mockService.findOne).toHaveBeenCalledWith('1');
  });

  it('should create project via create', async () => {
    mockService.create.mockResolvedValue({ id: '1', title: 'Created' });
    const res = await controller.create({ title: 'Created' });
    expect(res.title).toBe('Created');
  });

  it('should remove project via remove', async () => {
    mockService.remove.mockResolvedValue(undefined);
    const res = await controller.remove('1');
    expect(res.success).toBe(true);
  });
});
