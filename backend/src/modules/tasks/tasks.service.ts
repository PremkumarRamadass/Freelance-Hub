import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task with id ${id} not found`);
    return task;
  }

  async create(data: Partial<Task>): Promise<Task> {
    const task = this.taskRepo.create({
      ...data,
      priority: data.priority ?? 'Medium',
      status: data.status ?? 'Pending',
      estimatedHours: data.estimatedHours ?? 0,
      loggedHours: data.loggedHours ?? 0,
    });
    return this.taskRepo.save(task);
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, data);
    return this.taskRepo.save(task);
  }

  async toggleStatus(id: string): Promise<Task> {
    const task = await this.findOne(id);
    if (task.status === 'Completed') {
      task.status = 'Pending';
    } else if (task.status === 'Pending') {
      task.status = 'In Progress';
    } else {
      task.status = 'Completed';
    }
    return this.taskRepo.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepo.remove(task);
  }
}
