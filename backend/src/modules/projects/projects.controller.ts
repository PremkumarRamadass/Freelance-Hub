import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProjectsService } from './projects.service.js';
import { Project } from '../../entities/project.entity.js';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all client contracts and projects (Projects Screen)' })
  @ApiResponse({ status: 200, description: 'All active and completed projects' })
  async findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details with sprint progress (Project Details Screen)' })
  async findOne(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project contract' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async create(@Body() data: Partial<Project>): Promise<Project> {
    return this.projectsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project details, milestones, or status' })
  async update(@Param('id') id: string, @Body() data: Partial<Project>): Promise<Project> {
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.projectsService.remove(id);
    return { success: true };
  }
}
