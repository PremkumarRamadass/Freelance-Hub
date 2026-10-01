import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalsService } from './proposals.service.js';
import type { SubmitProposalDto } from './proposals.service.js';
import { Proposal } from '../../entities/proposal.entity.js';
import { User } from '../../entities/user.entity.js';
import { extractUserFromRequest } from '../auth/auth-user.util.js';

@ApiTags('Proposals')
@Controller()
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Get('projects/:projectId/proposals')
  @ApiOperation({ summary: 'Get all proposals submitted for a specific project' })
  async findByProject(@Param('projectId') projectId: string): Promise<Proposal[]> {
    return this.proposalsService.findByProject(projectId);
  }

  @Post('projects/:projectId/proposals')
  @ApiOperation({ summary: 'Submit a quotation/proposal for a published project' })
  @ApiResponse({ status: 201, description: 'Proposal submitted successfully' })
  async submitProposal(
    @Param('projectId') projectId: string,
    @Body() dto: SubmitProposalDto,
    @Req() req: Request,
  ): Promise<Proposal> {
    const authUser = await extractUserFromRequest(req, this.userRepo);

    const freelancer = {
      id: authUser?.id || (dto as any).freelancerId || 'user_prem_freelancer',
      name: authUser?.name || (dto as any).freelancerName || 'Premkumar',
      email: authUser?.email || (dto as any).freelancerEmail || 'prem@lancenexa.dev',
      avatarUrl: authUser?.avatarUrl || (dto as any).freelancerAvatar,
    };

    return this.proposalsService.submitProposal(projectId, dto, freelancer);
  }

  @Put('proposals/:id/accept')
  @ApiOperation({ summary: 'Client accepts a proposal and assigns project to freelancer' })
  async acceptProposal(@Param('id') id: string, @Req() req: Request) {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    return this.proposalsService.acceptProposal(id, authUser?.id);
  }

  @Put('proposals/:id/reject')
  @ApiOperation({ summary: 'Client declines/rejects a proposal' })
  async rejectProposal(@Param('id') id: string, @Req() req: Request): Promise<Proposal> {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    return this.proposalsService.rejectProposal(id, authUser?.id);
  }

  @Get('proposals/my')
  @ApiOperation({ summary: 'Get current freelancer submitted proposals' })
  async findMyProposals(@Req() req: Request): Promise<Proposal[]> {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    const freelancerId = authUser?.id || 'user_prem_freelancer';
    return this.proposalsService.findByFreelancer(freelancerId);
  }
}
