import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, ILike } from 'typeorm';
import { Project, ProjectStatus } from '../../entities/project.entity.js';

export interface ProjectFilterDto {
  status?: string;
  category?: string;
  search?: string;
  clientId?: string;
  assignedFreelancerId?: string;
  skill?: string;
  minBudget?: number;
  maxBudget?: number;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async findAll(filter?: ProjectFilterDto): Promise<Project[]> {
    const hasFilter =
      filter &&
      Object.values(filter).some(v => v !== undefined && v !== '' && v !== 'All');
    if (!hasFilter) {
      return this.projectRepo.find({ order: { createdAt: 'DESC' } });
    }

    const qb = this.projectRepo.createQueryBuilder('project');

    if (filter?.status && filter.status !== 'All') {
      qb.andWhere('project.status = :status', { status: filter.status });
    }

    if (filter?.category && filter.category !== 'All') {
      qb.andWhere('project.category = :category', { category: filter.category });
    }

    if (filter?.clientId) {
      qb.andWhere('(project.clientId = :clientId OR project.client ILIKE :clientQuery)', {
        clientId: filter.clientId,
        clientQuery: `%${filter.clientId}%`,
      });
    }

    if (filter?.assignedFreelancerId) {
      qb.andWhere('project.assignedFreelancerId = :freelancerId', {
        freelancerId: filter.assignedFreelancerId,
      });
    }

    if (filter?.search) {
      qb.andWhere(
        '(project.name ILIKE :search OR project.description ILIKE :search OR project.client ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    return qb.orderBy('project.createdAt', 'DESC').getMany();
  }

  async findMarketplace(filter?: ProjectFilterDto): Promise<Project[]> {
    const qb = this.projectRepo.createQueryBuilder('project');

    // Only Published and Under Review are open for proposals in the marketplace
    qb.where('project.status IN (:...statuses)', {
      statuses: ['Published', 'Under Review'],
    });

    if (filter?.category && filter.category !== 'All') {
      qb.andWhere('project.category = :category', { category: filter.category });
    }

    if (filter?.search) {
      qb.andWhere(
        '(project.name ILIKE :search OR project.description ILIKE :search OR project.client ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    if (filter?.minBudget) {
      qb.andWhere('project.budget >= :minBudget', { minBudget: Number(filter.minBudget) });
    }

    if (filter?.maxBudget) {
      qb.andWhere('project.budget <= :maxBudget', { maxBudget: Number(filter.maxBudget) });
    }

    const projects = await qb.orderBy('project.createdAt', 'DESC').getMany();

    if (filter?.skill && filter.skill !== 'All') {
      const targetSkill = filter.skill.toLowerCase();
      return projects.filter(p =>
        p.requiredSkills?.some(s => s.toLowerCase().includes(targetSkill)),
      );
    }

    return projects;
  }

  async findMyProjects(
    clientId: string,
    clientCompany?: string,
  ): Promise<Project[]> {
    const qb = this.projectRepo.createQueryBuilder('project');

    if (clientCompany) {
      qb.where('(project.clientId = :clientId OR project.client ILIKE :company)', {
        clientId,
        company: `%${clientCompany}%`,
      });
    } else {
      qb.where('project.clientId = :clientId', { clientId });
    }

    return qb.orderBy('project.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project with id ${id} not found`);
    return project;
  }

  async create(data: Partial<Project>, clientUser?: any): Promise<Project> {
    const budgetVal = Number(data.budget ?? data.maxBudget ?? 50000);

    const project = this.projectRepo.create({
      ...data,
      name: data.name || (data as any).title || 'Untitled Project',
      client: data.client || clientUser?.companyName || clientUser?.name || 'Enterprise Partner',
      clientId: clientUser?.id || data.clientId,
      clientName: clientUser?.name || data.clientName || 'Client',
      clientCompany: clientUser?.companyName || data.clientCompany || data.client,
      budgetType: data.budgetType || 'Fixed Price',
      budget: budgetVal,
      minBudget: data.minBudget ? Number(data.minBudget) : undefined,
      maxBudget: data.maxBudget ? Number(data.maxBudget) : budgetVal,
      spent: data.spent ?? 0,
      progress: data.progress ?? 0,
      tasksCount: data.tasksCount ?? 0,
      completedTasks: data.completedTasks ?? 0,
      proposalsCount: 0,
      priority: data.priority || 'Medium',
      requiredSkills: Array.isArray(data.requiredSkills)
        ? data.requiredSkills
        : data.requiredSkills
          ? String(data.requiredSkills).split(',').map(s => s.trim()).filter(Boolean)
          : [],
      attachments: Array.isArray(data.attachments)
        ? data.attachments
        : data.attachments
          ? [String(data.attachments)]
          : [],
      status: (data.status as ProjectStatus) || 'Draft',
    });

    return this.projectRepo.save(project);
  }

  async update(id: string, data: Partial<Project>, clientUser?: any): Promise<Project> {
    const project = await this.findOne(id);

    if (clientUser && project.clientId && project.clientId !== clientUser.id) {
      throw new ForbiddenException('You can only modify projects created under your account.');
    }

    if (data.requiredSkills && typeof data.requiredSkills === 'string') {
      data.requiredSkills = String(data.requiredSkills)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    Object.assign(project, data);
    return this.projectRepo.save(project);
  }

  async updateStatus(
    id: string,
    newStatus: ProjectStatus,
    clientUser?: any,
  ): Promise<Project> {
    const project = await this.findOne(id);

    if (clientUser && project.clientId && project.clientId !== clientUser.id) {
      throw new ForbiddenException('You can only update the status of your own projects.');
    }

    // Validation rules:
    // If unpublishing (back to Draft), ensure project is not already Assigned or In Progress
    if (newStatus === 'Draft' && project.status === 'Assigned') {
      throw new BadRequestException('Cannot unpublish an assigned project.');
    }

    project.status = newStatus;
    return this.projectRepo.save(project);
  }

  async remove(id: string, clientUser?: any): Promise<void> {
    const project = await this.findOne(id);

    if (clientUser && project.clientId && project.clientId !== clientUser.id) {
      throw new ForbiddenException('You can only delete projects you created.');
    }

    await this.projectRepo.remove(project);
  }
}
