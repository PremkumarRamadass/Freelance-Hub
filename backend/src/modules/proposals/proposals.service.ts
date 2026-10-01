import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Proposal } from '../../entities/proposal.entity.js';
import { Project } from '../../entities/project.entity.js';
import { Notification } from '../../entities/notification.entity.js';
import { User } from '../../entities/user.entity.js';

export interface SubmitProposalDto {
  proposedPrice: number;
  estimatedDelivery: string;
  coverLetter: string;
  relevantExperience?: string;
  attachments?: string;
}

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepo: Repository<Proposal>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByProject(projectId: string): Promise<Proposal[]> {
    return this.proposalRepo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByFreelancer(freelancerId: string): Promise<Proposal[]> {
    return this.proposalRepo.find({
      where: { freelancerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Proposal> {
    const proposal = await this.proposalRepo.findOne({ where: { id } });
    if (!proposal) throw new NotFoundException(`Proposal with id ${id} not found`);
    return proposal;
  }

  async submitProposal(
    projectId: string,
    dto: SubmitProposalDto,
    freelancer: { id: string; name: string; email: string; avatarUrl?: string },
  ): Promise<Proposal> {
    if (!dto.proposedPrice || dto.proposedPrice <= 0) {
      throw new BadRequestException('Please provide a valid proposed price.');
    }
    if (!dto.estimatedDelivery?.trim()) {
      throw new BadRequestException('Please provide an estimated delivery timeframe.');
    }
    if (!dto.coverLetter || dto.coverLetter.trim().length < 10) {
      throw new BadRequestException('Cover letter must be at least 10 characters.');
    }

    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id ${projectId} not found`);
    }

    // Only allow proposals for Published or Under Review projects
    if (project.status !== 'Published' && project.status !== 'Under Review') {
      throw new BadRequestException(
        `Proposals can only be submitted for Published projects. Current status is ${project.status}.`,
      );
    }

    // Check if freelancer already has an active proposal
    const existing = await this.proposalRepo.findOne({
      where: {
        projectId,
        freelancerId: freelancer.id,
        status: In(['Submitted', 'Under Review', 'Accepted']),
      },
    });

    if (existing) {
      throw new BadRequestException(
        'You have already submitted an active proposal for this project.',
      );
    }

    const proposal = this.proposalRepo.create({
      projectId,
      projectTitle: project.name,
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
      freelancerEmail: freelancer.email,
      freelancerAvatar:
        freelancer.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      proposedPrice: Number(dto.proposedPrice),
      estimatedDelivery: dto.estimatedDelivery.trim(),
      coverLetter: dto.coverLetter.trim(),
      relevantExperience: dto.relevantExperience?.trim(),
      attachments: dto.attachments?.trim(),
      status: 'Submitted',
    });

    const saved = await this.proposalRepo.save(proposal);

    // Update project proposals count and status
    project.proposalsCount = (project.proposalsCount || 0) + 1;
    if (project.status === 'Published') {
      project.status = 'Under Review';
    }
    await this.projectRepo.save(project);

    // Notify project client
    await this.notifRepo.save(
      this.notifRepo.create({
        title: 'New Proposal Received',
        message: `${freelancer.name} submitted a proposal (₹${dto.proposedPrice}) for "${project.name}"`,
        type: 'info',
        time: 'Just now',
        read: false,
      }),
    );

    return saved;
  }

  async acceptProposal(
    proposalId: string,
    clientUserId?: string,
  ): Promise<{ proposal: Proposal; project: Project }> {
    const proposal = await this.findOne(proposalId);
    const project = await this.projectRepo.findOne({ where: { id: proposal.projectId } });
    if (!project) throw new NotFoundException('Associated project not found');

    // Security: If clientUserId is provided, verify client owns project
    if (clientUserId && project.clientId && project.clientId !== clientUserId) {
      throw new ForbiddenException('You can only accept proposals for projects you own.');
    }

    // Only allow accepting if not already Assigned or Completed
    if (
      project.status === 'Assigned' ||
      project.status === 'In Progress' ||
      project.status === 'Completed'
    ) {
      throw new BadRequestException('This project has already been assigned or completed.');
    }

    // Accept proposal
    proposal.status = 'Accepted';
    const savedProposal = await this.proposalRepo.save(proposal);

    // Update Project Status & Assignment
    project.status = 'Assigned';
    project.assignedFreelancerId = proposal.freelancerId;
    project.assignedFreelancerName = proposal.freelancerName;
    project.assignedFreelancerEmail = proposal.freelancerEmail;
    project.assignedFreelancerAvatar = proposal.freelancerAvatar;
    if (proposal.proposedPrice > 0) {
      project.budget = Number(proposal.proposedPrice);
    }
    const savedProject = await this.projectRepo.save(project);

    // Reject all other active proposals for this project
    const otherProposals = await this.proposalRepo.find({
      where: { projectId: project.id },
    });
    for (const p of otherProposals) {
      if (p.id !== proposalId && (p.status === 'Submitted' || p.status === 'Under Review')) {
        p.status = 'Rejected';
        await this.proposalRepo.save(p);
      }
    }

    // Notify accepted Freelancer
    await this.notifRepo.save(
      this.notifRepo.create({
        title: 'Proposal Accepted! 🎉',
        message: `Your proposal for "${project.name}" was accepted! The project is now assigned to you.`,
        type: 'success',
        time: 'Just now',
        read: false,
      }),
    );

    return { proposal: savedProposal, project: savedProject };
  }

  async rejectProposal(proposalId: string, clientUserId?: string): Promise<Proposal> {
    const proposal = await this.findOne(proposalId);
    const project = await this.projectRepo.findOne({ where: { id: proposal.projectId } });

    if (clientUserId && project?.clientId && project.clientId !== clientUserId) {
      throw new ForbiddenException('You can only reject proposals for your own projects.');
    }

    proposal.status = 'Rejected';
    const saved = await this.proposalRepo.save(proposal);

    await this.notifRepo.save(
      this.notifRepo.create({
        title: 'Proposal Status Update',
        message: `Your proposal for "${proposal.projectTitle}" was not selected.`,
        type: 'warning',
        time: 'Just now',
        read: false,
      }),
    );

    return saved;
  }
}
