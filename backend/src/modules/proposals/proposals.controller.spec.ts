import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProposalsController } from './proposals.controller.js';
import { ProposalsService } from './proposals.service.js';
import { User } from '../../entities/user.entity.js';

describe('ProposalsController', () => {
  let controller: ProposalsController;
  let mockService: any;
  let mockUserRepo: any;

  beforeEach(async () => {
    mockService = {
      findByProject: vi.fn().mockResolvedValue([{ id: 'prop_1' }]),
      submitProposal: vi.fn().mockResolvedValue({ id: 'prop_new', status: 'Submitted' }),
      acceptProposal: vi.fn().mockResolvedValue({ success: true }),
      rejectProposal: vi.fn().mockResolvedValue({ id: 'prop_1', status: 'Rejected' }),
      findByFreelancer: vi.fn().mockResolvedValue([{ id: 'prop_1' }]),
    };

    mockUserRepo = {
      findOne: vi.fn().mockResolvedValue({ id: 'user_1', name: 'Prem', role: 'FREELANCER' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProposalsController],
      providers: [
        { provide: ProposalsService, useValue: mockService },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    controller = module.get<ProposalsController>(ProposalsController);
  });

  it('should list proposals by project id', async () => {
    const res = await controller.findByProject('prj_1');
    expect(res.length).toBe(1);
    expect(mockService.findByProject).toHaveBeenCalledWith('prj_1');
  });

  it('should delegate submitProposal', async () => {
    const mockReq: any = { headers: {} };
    const res = await controller.submitProposal(
      'prj_1',
      {
        proposedPrice: 50000,
        estimatedDelivery: '15 Days',
        coverLetter: 'Expert proposal letter.',
      },
      mockReq,
    );
    expect(res.id).toBe('prop_new');
    expect(mockService.submitProposal).toHaveBeenCalled();
  });

  it('should delegate acceptProposal', async () => {
    const mockReq: any = { headers: {} };
    const res = await controller.acceptProposal('prop_1', mockReq);
    expect(res).toBeDefined();
    expect(mockService.acceptProposal).toHaveBeenCalled();
  });

  it('should delegate rejectProposal', async () => {
    const mockReq: any = { headers: {} };
    const res = await controller.rejectProposal('prop_1', mockReq);
    expect(res.status).toBe('Rejected');
    expect(mockService.rejectProposal).toHaveBeenCalled();
  });
});
