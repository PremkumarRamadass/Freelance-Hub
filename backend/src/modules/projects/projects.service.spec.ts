import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { Project } from '../../entities/project.entity.js';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectRepo: any;

  const mockProject = {
    id: 'prj_1',
    title: 'E-Commerce Platform',
    clientId: 'cli_1',
    budget: 150000,
    progress: 50,
    status: 'In Progress',
  };

  beforeEach(async () => {
    mockProjectRepo = {
      find: vi.fn().mockResolvedValue([mockProject]),
      findOne: vi.fn(),
      create: vi.fn((data) => ({ id: 'prj_new', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepo,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should return all projects on findAll', async () => {
    const projects = await service.findAll();
    expect(projects.length).toBe(1);
    expect(mockProjectRepo.find).toHaveBeenCalled();
  });

  it('should return a project by id', async () => {
    mockProjectRepo.findOne.mockResolvedValue(mockProject);
    const p = await service.findOne('prj_1');
    expect(p.id).toBe('prj_1');
  });

  it('should throw NotFoundException if project not found', async () => {
    mockProjectRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should create and save a new project', async () => {
    const data = { title: 'Mobile App', budget: 75000 };
    const p = await service.create(data);
    expect(p.title).toBe('Mobile App');
    expect(mockProjectRepo.create).toHaveBeenCalled();
    expect(mockProjectRepo.save).toHaveBeenCalled();
  });

  it('should delete a project', async () => {
    mockProjectRepo.findOne.mockResolvedValue(mockProject);
    await service.remove('prj_1');
    expect(mockProjectRepo.remove).toHaveBeenCalledWith(mockProject);
  });
});
