import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from './reports.service.js';
import { Project } from '../../entities/project.entity.js';
import { Client } from '../../entities/client.entity.js';
import { Invoice } from '../../entities/invoice.entity.js';
import { Payment } from '../../entities/payment.entity.js';

describe('ReportsService', () => {
  let service: ReportsService;
  let mockProjectRepo: any;
  let mockClientRepo: any;
  let mockInvoiceRepo: any;
  let mockPaymentRepo: any;

  beforeEach(async () => {
    mockProjectRepo = {
      find: vi.fn().mockResolvedValue([
        { id: '1', budget: 100000, status: 'In Progress', name: 'Prj 1', client: 'Client 1', spent: 10000, progress: 50, deadline: '2026-12-31' },
      ]),
    };
    mockClientRepo = {
      find: vi.fn().mockResolvedValue([
        { id: '1', name: 'Client 1', company: 'ABC', email: 'c@abc.com', projectsCount: 1, totalBilled: 100000, status: 'Active' },
      ]),
    };
    mockInvoiceRepo = {
      find: vi.fn().mockResolvedValue([
        { id: '1', paidAmount: 50000, balanceAmount: 10000, taxAmount: 9000 },
      ]),
    };
    mockPaymentRepo = {
      find: vi.fn().mockResolvedValue([{ id: '1', amount: 50000 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: getRepositoryToken(Client), useValue: mockClientRepo },
        { provide: getRepositoryToken(Invoice), useValue: mockInvoiceRepo },
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should calculate financial summary accurately', async () => {
    const summary = await service.getFinancialSummary();
    expect(summary.totalContractValue).toBe(100000);
    expect(summary.totalCollected).toBe(50000);
    expect(summary.pendingCollection).toBe(10000);
    expect(summary.activeProjectsCount).toBe(1);
  });

  it('should return monthly trends', async () => {
    const trends = await service.getMonthlyTrends();
    expect(trends.length).toBeGreaterThan(0);
  });

  it('should export csv formatted string', async () => {
    const csv = await service.exportCsvData();
    expect(csv).toContain('Project Name,Client,Category');
    expect(csv).toContain('Prj 1');
  });
});
