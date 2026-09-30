import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project with id ${id} not found`);
    return project;
  }

  async create(data: Partial<Project>): Promise<Project> {
    const project = this.projectRepo.create({
      ...data,
      budget: data.budget ?? 0,
      spent: data.spent ?? 0,
      progress: data.progress ?? 0,
      tasksCount: data.tasksCount ?? 0,
      completedTasks: data.completedTasks ?? 0,
      status: data.status ?? 'Planning',
    });
    return this.projectRepo.save(project);
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, data);
    return this.projectRepo.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepo.remove(project);
  }
}
