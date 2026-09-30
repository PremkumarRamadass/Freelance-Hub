import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service.js';
import {
  Project,
  Client,
  Task,
  Invoice,
  Quotation,
  Payment,
} from '../../entities/index.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockProjectRepo: any;
  let mockClientRepo: any;
  let mockTaskRepo: any;
  let mockInvoiceRepo: any;
  let mockQuoteRepo: any;
  let mockPaymentRepo: any;

  beforeEach(async () => {
    mockProjectRepo = {
      find: vi.fn().mockResolvedValue([
        { id: '1', status: 'In Progress' },
        { id: '2', status: 'Completed' },
      ]),
    };
    mockClientRepo = {
      count: vi.fn().mockResolvedValue(5),
    };
    mockTaskRepo = {
      find: vi.fn().mockResolvedValue([
        { id: '1', status: 'Completed' },
        { id: '2', status: 'In Progress' },
        { id: '3', status: 'Pending' },
      ]),
    };
    mockInvoiceRepo = {
      find: vi.fn().mockResolvedValue([
        { id: '1', paidAmount: 40000, balanceAmount: 10000 },
      ]),
    };
    mockQuoteRepo = {
      find: vi.fn().mockResolvedValue([{ id: '1', totalAmount: 50000 }]),
    };
    mockPaymentRepo = {
      find: vi.fn().mockResolvedValue([{ id: '1', amount: 40000 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: getRepositoryToken(Client), useValue: mockClientRepo },
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
        { provide: getRepositoryToken(Invoice), useValue: mockInvoiceRepo },
        { provide: getRepositoryToken(Quotation), useValue: mockQuoteRepo },
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should compile getStats with accurate KPI metrics', async () => {
    const stats = await service.getStats();
    expect(stats.kpis.totalProjects).toBe(2);
    expect(stats.kpis.activeProjects).toBe(1);
    expect(stats.kpis.completedProjects).toBe(1);
    expect(stats.kpis.totalRevenue).toBe(40000);
    expect(stats.kpis.pendingAmount).toBe(10000);
    expect(stats.kpis.clientsCount).toBe(5);
    expect(stats.tasks.total).toBe(3);
    expect(stats.tasks.completed).toBe(1);
    expect(stats.tasks.inProgress).toBe(1);
    expect(stats.tasks.pending).toBe(1);
    expect(stats.monthlyData.length).toBeGreaterThan(0);
  });

  it('should compile getClientPortalStats for client email', async () => {
    const portal = await service.getClientPortalStats('client@example.com');
    expect(portal.paidToDate).toBe(40000);
    expect(portal.pendingHandoverDue).toBe(10000);
  });
});
