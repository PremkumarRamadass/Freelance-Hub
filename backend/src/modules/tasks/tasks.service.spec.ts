import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { Task } from '../../entities/task.entity.js';

describe('TasksService', () => {
  let service: TasksService;
  let mockTaskRepo: any;

  const mockTask = {
    id: 'task_1',
    title: 'Wireframes',
    status: 'Pending',
    priority: 'Medium',
  };

  beforeEach(async () => {
    mockTaskRepo = {
      find: vi.fn().mockResolvedValue([mockTask]),
      findOne: vi.fn(),
      create: vi.fn((data) => ({ id: 'task_new', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepo,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should list all tasks', async () => {
    const list = await service.findAll();
    expect(list.length).toBe(1);
  });

  it('should get task by id', async () => {
    mockTaskRepo.findOne.mockResolvedValue(mockTask);
    const task = await service.findOne('task_1');
    expect(task.id).toBe('task_1');
  });

  it('should throw NotFoundException if task missing', async () => {
    mockTaskRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should toggle task status from Pending to In Progress', async () => {
    mockTaskRepo.findOne.mockResolvedValue({ ...mockTask, status: 'Pending' });
    const toggled = await service.toggleStatus('task_1');
    expect(toggled.status).toBe('In Progress');
  });

  it('should toggle task status from In Progress to Completed', async () => {
    mockTaskRepo.findOne.mockResolvedValue({ ...mockTask, status: 'In Progress' });
    const toggled = await service.toggleStatus('task_1');
    expect(toggled.status).toBe('Completed');
  });

  it('should delete task', async () => {
    mockTaskRepo.findOne.mockResolvedValue(mockTask);
    await service.remove('task_1');
    expect(mockTaskRepo.remove).toHaveBeenCalledWith(mockTask);
  });
});
