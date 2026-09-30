import { Controller, Get, Post, Put, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TasksService } from './tasks.service.js';
import { Task } from '../../entities/task.entity.js';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List all sprint tasks (Tasks Screen)' })
  @ApiResponse({ status: 200, description: 'All tasks with status and deadlines' })
  async findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task details by ID' })
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a sprint deliverable task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  async create(@Body() data: Partial<Task>): Promise<Task> {
    return this.tasksService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task details, assignee, or priority' })
  async update(@Param('id') id: string, @Body() data: Partial<Task>): Promise<Task> {
    return this.tasksService.update(id, data);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle task completion status between Pending and Completed' })
  async toggleStatus(@Param('id') id: string): Promise<Task> {
    return this.tasksService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.tasksService.remove(id);
    return { success: true };
  }
}
