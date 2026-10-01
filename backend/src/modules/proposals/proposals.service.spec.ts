import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProposalsService } from './proposals.service.js';
import { Proposal } from '../../entities/proposal.entity.js';
import { Project } from '../../entities/project.entity.js';
import { Notification } from '../../entities/notification.entity.js';
import { User } from '../../entities/user.entity.js';

describe('ProposalsService', () => {
  let service: ProposalsService;
  let mockProposalRepo: any;
  let mockProjectRepo: any;
  let mockNotifRepo: any;
  let mockUserRepo: any;

  const mockProject: any = {
    id: 'prj_test_1',
    name: 'Cloud Infrastructure Pipeline',
    status: 'Published',
    budget: 65000,
    proposalsCount: 0,
    client: 'ABC Pvt Ltd',
  };

  const mockProposal: any = {
    id: 'prop_test_1',
    projectId: 'prj_test_1',
    projectTitle: 'Cloud Infrastructure Pipeline',
    freelancerId: 'user_prem',
    freelancerName: 'Premkumar',
    freelancerEmail: 'prem@lancenexa.dev',
    proposedPrice: 60000,
    estimatedDelivery: '20 Days',
    coverLetter: 'I am a DevOps specialist with 5 years experience.',
    status: 'Submitted',
  };

  beforeEach(async () => {
    mockProposalRepo = {
      find: vi.fn().mockResolvedValue([mockProposal]),
      findOne: vi.fn(),
      create: vi.fn((data) => ({ id: 'prop_new', ...data })),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    mockProjectRepo = {
      findOne: vi.fn().mockResolvedValue({ ...mockProject }),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    mockNotifRepo = {
      create: vi.fn((data) => data),
      save: vi.fn().mockResolvedValue({ id: 'notif_1' }),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalsService,
        { provide: getRepositoryToken(Proposal), useValue: mockProposalRepo },
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: getRepositoryToken(Notification), useValue: mockNotifRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<ProposalsService>(ProposalsService);
  });

  it('should find proposals by projectId', async () => {
    const list = await service.findByProject('prj_test_1');
    expect(list.length).toBe(1);
    expect(mockProposalRepo.find).toHaveBeenCalledWith({
      where: { projectId: 'prj_test_1' },
      order: { createdAt: 'DESC' },
    });
  });

  it('should submit a valid proposal and increment project proposalsCount', async () => {
    mockProposalRepo.findOne.mockResolvedValue(null); // No existing active proposal
    const result = await service.submitProposal(
      'prj_test_1',
      {
        proposedPrice: 60000,
        estimatedDelivery: '20 Days',
        coverLetter: 'Extensive DevOps and Cloud experience.',
      },
      {
        id: 'user_prem',
        name: 'Premkumar',
        email: 'prem@lancenexa.dev',
      },
    );

    expect(result).toBeDefined();
    expect(result.status).toBe('Submitted');
    expect(mockProjectRepo.save).toHaveBeenCalled();
    expect(mockNotifRepo.save).toHaveBeenCalled();
  });

  it('should prevent duplicate active proposals from the same freelancer', async () => {
    mockProposalRepo.findOne.mockResolvedValue(mockProposal); // Existing active proposal
    await expect(
      service.submitProposal(
        'prj_test_1',
        {
          proposedPrice: 60000,
          estimatedDelivery: '20 Days',
          coverLetter: 'Duplicate attempt proposal.',
        },
        {
          id: 'user_prem',
          name: 'Premkumar',
          email: 'prem@lancenexa.dev',
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should accept a proposal and assign project to the freelancer', async () => {
    mockProposalRepo.findOne.mockResolvedValue({ ...mockProposal });
    mockProposalRepo.find.mockResolvedValue([
      { ...mockProposal },
      { id: 'prop_2', projectId: 'prj_test_1', status: 'Submitted' },
    ]);

    const res = await service.acceptProposal('prop_test_1');
    expect(res.proposal.status).toBe('Accepted');
    expect(res.project.status).toBe('Assigned');
    expect(res.project.assignedFreelancerId).toBe('user_prem');
  });

  it('should reject a proposal and notify freelancer', async () => {
    mockProposalRepo.findOne.mockResolvedValue({ ...mockProposal });
    const res = await service.rejectProposal('prop_test_1');
    expect(res.status).toBe('Rejected');
    expect(mockNotifRepo.save).toHaveBeenCalled();
  });
});
