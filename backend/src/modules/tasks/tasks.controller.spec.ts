import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

describe('TasksController', () => {
  let controller: TasksController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      toggleStatus: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should list all tasks', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1', title: 'Task 1' }]);
    const res = await controller.findAll();
    expect(res.length).toBe(1);
  });

  it('should toggle task status', async () => {
    mockService.toggleStatus.mockResolvedValue({ id: '1', status: 'Completed' });
    const res = await controller.toggleStatus('1');
    expect(res.status).toBe('Completed');
    expect(mockService.toggleStatus).toHaveBeenCalledWith('1');
  });

  it('should remove task', async () => {
    mockService.remove.mockResolvedValue(undefined);
    const res = await controller.remove('1');
    expect(res.success).toBe(true);
  });
});
