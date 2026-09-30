import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service.js';
import type { ProjectFilterDto } from './projects.service.js';
import { Project } from '../../entities/project.entity.js';
import type { ProjectStatus } from '../../entities/project.entity.js';
import { User } from '../../entities/user.entity.js';
import { extractUserFromRequest } from '../auth/auth-user.util.js';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all client contracts and projects' })
  @ApiResponse({ status: 200, description: 'All active and completed projects' })
  async findAll(@Query() query?: ProjectFilterDto): Promise<Project[]> {
    return this.projectsService.findAll(query);
  }

  @Get('marketplace')
  @ApiOperation({ summary: 'Browse published marketplace projects open for proposals' })
  async findMarketplace(@Query() query?: ProjectFilterDto): Promise<Project[]> {
    return this.projectsService.findMarketplace(query);
  }

  @Get('my-projects')
  @ApiOperation({ summary: 'Get projects owned by the currently authenticated client' })
  async findMyProjects(@Req() req: Request): Promise<Project[]> {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    const clientId = authUser?.id || 'client_abc_id';
    return this.projectsService.findMyProjects(clientId, authUser?.companyName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details with sprint progress' })
  async findOne(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project contract or client job posting' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async create(@Body() data: Partial<Project>, @Req() req: Request): Promise<Project> {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    return this.projectsService.create(data, authUser);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project details, milestones, or configuration' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Project>,
    @Req() req: Request,
  ): Promise<Project> {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    return this.projectsService.update(id, data, authUser);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Transition project lifecycle status (Publish, Unpublish, Cancel, Close)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProjectStatus,
    @Req() req: Request,
  ): Promise<Project> {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    return this.projectsService.updateStatus(id, status, authUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async remove(@Param('id') id: string, @Req() req: Request): Promise<{ success: boolean }> {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    await this.projectsService.remove(id, authUser);
    return { success: true };
  }
}
